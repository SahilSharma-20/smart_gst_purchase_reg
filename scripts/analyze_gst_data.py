#!/usr/bin/env python3
"""
Analyzes GST_Purchase_Register.xlsx → webapp/model/data/gst_analysis.json
Run from project root: python3 scripts/analyze_gst_data.py
"""

import pandas as pd
import numpy as np
import json
import os
import sys
from datetime import datetime

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INPUT_FILE   = os.path.join(PROJECT_ROOT, "webapp", "model", "data", "GST_Purchase_Register.xlsx")
OUTPUT_FILE  = os.path.join(PROJECT_ROOT, "webapp", "model", "data", "gst_analysis.json")


def inr(value):
    """Return human-readable Indian currency format."""
    v = abs(float(value))
    if v >= 1e7:
        return f"\u20b9{v/1e7:.2f} Cr"
    elif v >= 1e5:
        return f"\u20b9{v/1e5:.2f} L"
    elif v >= 1000:
        return f"\u20b9{v:,.0f}"
    return f"\u20b9{v:.0f}"


def analyze():
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: {INPUT_FILE} not found.")
        print("Run convert_excel_to_json.py first and ensure Excel is in webapp/model/data/")
        sys.exit(1)

    print(f"Reading: {INPUT_FILE}")
    df = pd.read_excel(INPUT_FILE)
    print(f"Data: {len(df)} rows × {len(df.columns)} columns\n")

    insights = []

    # ── Numeric columns – fill NaN with 0 ──────────────────────────────
    num_cols = [
        "Total Invoice Value", "Taxable Value", "Total Tax Value Including Cess",
        "IGST Amount", "CGST Amount", "SGST Amount",
        "RCM IGST Amount", "RCM CGST Amount", "RCM SGST Amount",
        "Freight Amount", "Non Deductable tax Amount", "TCS Amount"
    ]
    for c in num_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # ── Core Metrics ────────────────────────────────────────────────────
    total_records       = len(df)
    total_invoice_val   = float(df["Total Invoice Value"].sum())
    total_taxable_val   = float(df["Taxable Value"].sum())
    total_tax_val       = float(df["Total Tax Value Including Cess"].sum())
    unique_vendors      = int(df["Vendor Code"].nunique())

    igst_total  = float(df["IGST Amount"].sum())
    cgst_total  = float(df["CGST Amount"].sum())
    sgst_total  = float(df["SGST Amount"].sum())
    rcm_igst    = float(df["RCM IGST Amount"].sum())
    rcm_cgst    = float(df["RCM CGST Amount"].sum())
    rcm_sgst    = float(df["RCM SGST Amount"].sum())
    rcm_total   = rcm_igst + rcm_cgst + rcm_sgst

    itc_yes     = int((df["ITC Eligibility"] == "Yes").sum())
    itc_no      = int((df["ITC Eligibility"] == "No").sum())
    goods_cnt   = int((df["Goods/Services"] == "GOODS").sum())
    service_cnt = int((df["Goods/Services"] == "SERVICE").sum())
    capital_cnt = int((df["Goods/Services"] == "CAPITAL").sum())

    # Missing GSTIN
    gstin_col  = df["Vendor GSTIN"].fillna("").astype(str).str.strip()
    miss_gstin = int((gstin_col == "").sum() + (gstin_col == "nan").sum())

    # Reversed / Reversal
    rev_ref_col = df["Reversal Ref"].fillna("").astype(str).str.strip()
    reversed_docs = df[(rev_ref_col != "") & (rev_ref_col != "nan")]
    reversed_cnt  = len(reversed_docs)
    reversed_val  = float(reversed_docs["Total Invoice Value"].sum())

    # Business place distribution
    bp_grp = (
        df[df["Business Place"].notna()]
        .groupby("Business Place")["Total Invoice Value"].sum()
        .sort_values(ascending=False)
    )

    # Vendor concentration
    vend_grp = (
        df.groupby("Vendor name")["Total Invoice Value"].sum()
        .sort_values(ascending=False)
    )
    top3_vend     = vend_grp.head(3)
    top3_val      = float(top3_vend.sum())
    top3_pct      = top3_val / total_invoice_val * 100 if total_invoice_val else 0

    # ── INSIGHT 1: Missing Vendor GSTIN ─────────────────────────────────
    if miss_gstin > 0:
        miss_val = float(
            df[(gstin_col == "") | (gstin_col == "nan")]["Total Invoice Value"].sum()
        )
        insights.append({
            "severity": "critical",
            "text": (
                f"{miss_gstin} invoice lines have no Vendor GSTIN on record "
                f"(invoice value: {inr(miss_val)}). "
                f"These will not appear in GSTR-2B auto-population and risk ITC denial "
                f"during GST reconciliation. Obtain GSTINs from vendors immediately."
            )
        })

    # ── INSIGHT 2: ITC Non-Eligibility ──────────────────────────────────
    itc_no_pct  = itc_no / total_records * 100 if total_records else 0
    itc_no_tax  = float(df[df["ITC Eligibility"] == "No"]["Total Tax Value Including Cess"].sum())
    if itc_no_pct >= 50:
        insights.append({
            "severity": "critical",
            "text": (
                f"{itc_no:,} records ({itc_no_pct:.1f}%) are ITC Non-Eligible — "
                f"representing {inr(itc_no_tax)} of non-recoverable input tax that will "
                f"flow to P&L as cost. This exceeds half the register volume; "
                f"review procurement categories to confirm correct ITC treatment."
            )
        })
    elif itc_no > 0:
        insights.append({
            "severity": "warning",
            "text": (
                f"{itc_no:,} records ({itc_no_pct:.1f}%) are ITC Non-Eligible — "
                f"totalling {inr(itc_no_tax)} of blocked credit. "
                f"Validate these are correctly classified per GST Section 17(5)."
            )
        })

    # ── INSIGHT 3: Vendor Concentration ─────────────────────────────────
    top3_str = "; ".join(
        [f"{v} ({inr(a)})" for v, a in top3_vend.items()]
    )
    sev_conc = "warning" if top3_pct >= 50 else "info"
    insights.append({
        "severity": sev_conc,
        "text": (
            f"Top 3 vendors represent {top3_pct:.1f}% ({inr(top3_val)}) "
            f"of total purchase value — "
            f"{'indicating high vendor concentration risk; consider diversifying supply base.' if top3_pct >= 50 else 'vendor mix is reasonably diversified.'} "
            f"Vendors: {top3_str}."
        )
    })

    # ── INSIGHT 4: Tax Mix (IGST vs CGST+SGST) ──────────────────────────
    total_gst = igst_total + cgst_total + sgst_total
    if total_gst > 0:
        igst_pct  = igst_total / total_gst * 100
        intra_pct = (cgst_total + sgst_total) / total_gst * 100
        note = (
            "High proportion of inter-state (IGST) procurement — "
            "ensure IGST credits are tracked in GSTR-3B and B2B reconciliation is current."
            if igst_pct >= 60 else
            "Tax type mix between inter-state (IGST) and intra-state (CGST/SGST) looks balanced."
        )
        insights.append({
            "severity": "warning" if igst_pct >= 60 else "info",
            "text": (
                f"Tax composition: IGST {inr(igst_total)} ({igst_pct:.1f}%), "
                f"CGST {inr(cgst_total)} ({intra_pct/2:.1f}%), "
                f"SGST {inr(sgst_total)} ({intra_pct/2:.1f}%). {note}"
            )
        })

    # ── INSIGHT 5: RCM Liability ─────────────────────────────────────────
    rcm_records = int((df["RCM (Y/N)"].astype(str).str.strip().str.upper() == "YES").sum())
    if rcm_records > 0 or rcm_total > 0:
        insights.append({
            "severity": "warning",
            "text": (
                f"{rcm_records} invoices are under Reverse Charge Mechanism (RCM) "
                f"with a total self-assessed liability of {inr(rcm_total)}. "
                f"Confirm RCM tax payments are made in cash (ITC cannot be used) "
                f"and matching ITC claims are filed in GSTR-3B."
            )
        })

    # ── INSIGHT 6: Purchase Category Split ──────────────────────────────
    goods_val   = float(df[df["Goods/Services"] == "GOODS"]["Total Invoice Value"].sum())
    service_val = float(df[df["Goods/Services"] == "SERVICE"]["Total Invoice Value"].sum())
    capital_val = float(df[df["Goods/Services"] == "CAPITAL"]["Total Invoice Value"].sum())
    capital_tax = float(df[df["Goods/Services"] == "CAPITAL"]["Total Tax Value Including Cess"].sum())
    insights.append({
        "severity": "info" if capital_cnt < 100 else "warning",
        "text": (
            f"Purchase mix: Goods {goods_cnt} lines ({inr(goods_val)}), "
            f"Services {service_cnt} lines ({inr(service_val)}), "
            f"Capital Goods {capital_cnt} lines ({inr(capital_val)}, "
            f"tax {inr(capital_tax)}). "
            f"Capital goods ITC ({inr(capital_tax)}) must be availed in 60 equal monthly "
            f"instalments — track separately in TRAN/ITC ledger."
        )
    })

    # ── INSIGHT 7: Business Place Exposure ──────────────────────────────
    if not bp_grp.empty:
        top_bp     = bp_grp.index[0]
        top_bp_val = float(bp_grp.iloc[0])
        top_bp_pct = top_bp_val / total_invoice_val * 100 if total_invoice_val else 0
        insights.append({
            "severity": "info",
            "text": (
                f"Business Place '{top_bp}' has the highest purchase volume at "
                f"{inr(top_bp_val)} ({top_bp_pct:.1f}% of total) across "
                f"{len(bp_grp)} active business places. "
                f"Ensure GST state registrations and filing calendars are current for all locations."
            )
        })

    # ── INSIGHT 8: Reversed Documents ───────────────────────────────────
    if reversed_cnt > 0:
        insights.append({
            "severity": "warning",
            "text": (
                f"{reversed_cnt} documents carry a reversal reference, "
                f"totalling {inr(reversed_val)}. "
                f"Verify ITC reversals on these entries are correctly reported in GSTR-3B "
                f"to avoid mismatches with GSTN system data."
            )
        })

    # ── INSIGHT 9: Effective Tax Rate ────────────────────────────────────
    eff_rate = (total_tax_val / total_taxable_val * 100) if total_taxable_val else 0
    itc_rec_rate = itc_yes / total_records * 100 if total_records else 0
    insights.append({
        "severity": "info",
        "text": (
            f"Blended effective tax rate is {eff_rate:.2f}% on a taxable base of "
            f"{inr(total_taxable_val)} (total tax: {inr(total_tax_val)}). "
            f"ITC recovery rate is {itc_rec_rate:.1f}% — "
            f"{itc_yes:,} of {total_records:,} records are ITC-eligible. "
            f"Maximising eligible ITC is key to reducing net GST outflow."
        )
    })

    # ── Assemble output ──────────────────────────────────────────────────
    metrics = {
        "totalRecords":                 total_records,
        "totalInvoiceValue":            round(total_invoice_val, 2),
        "totalTaxableValue":            round(total_taxable_val, 2),
        "totalTaxValue":                round(total_tax_val, 2),
        "uniqueVendors":                unique_vendors,
        "itcEligibleRecords":           itc_yes,
        "itcNotEligibleRecords":        itc_no,
        "goodsRecords":                 goods_cnt,
        "serviceRecords":               service_cnt,
        "capitalRecords":               capital_cnt,
        "igstTotal":                    round(igst_total, 2),
        "cgstTotal":                    round(cgst_total, 2),
        "sgstTotal":                    round(sgst_total, 2),
        "rcmTotal":                     round(rcm_total, 2),
        "missingVendorGSTIN":           miss_gstin,
        "reversedDocuments":            reversed_cnt,
        "totalInvoiceValueFormatted":   inr(total_invoice_val),
        "totalTaxableValueFormatted":   inr(total_taxable_val),
        "totalTaxValueFormatted":       inr(total_tax_val),
        "igstFormatted":                inr(igst_total),
        "cgstFormatted":                inr(cgst_total),
        "sgstFormatted":                inr(sgst_total),
    }

    output = {
        "generatedAt": datetime.now().strftime("%d %b %Y, %H:%M:%S"),
        "metrics": metrics,
        "insights": insights
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Analysis complete → {OUTPUT_FILE}")
    print(f"Insights generated: {len(insights)}")
    print(f"\nKey Metrics:")
    print(f"  Total Records         : {total_records:,}")
    print(f"  Total Invoice Value   : {inr(total_invoice_val)}")
    print(f"  Total Taxable Value   : {inr(total_taxable_val)}")
    print(f"  Total Tax Value       : {inr(total_tax_val)}")
    print(f"  Unique Vendors        : {unique_vendors:,}")
    print(f"  ITC Eligible          : {itc_yes:,} records")
    print(f"  Missing Vendor GSTIN  : {miss_gstin}")


if __name__ == "__main__":
    analyze()