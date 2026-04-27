#!/usr/bin/env python3
"""
Converts GST_Purchase_Register.xlsx → webapp/model/data/gst_data.json
Run from project root: python3 scripts/convert_excel_to_json.py
"""

import pandas as pd
import json
import os
import sys

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INPUT_FILE  = os.path.join(PROJECT_ROOT, "webapp", "model", "data", "GST_Purchase_Register.xlsx")
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "webapp", "model", "data", "gst_data.json")

def convert():
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: File not found at {INPUT_FILE}")
        print("Place GST_Purchase_Register.xlsx inside webapp/model/data/")
        sys.exit(1)

    print(f"Reading: {INPUT_FILE}")
    df = pd.read_excel(INPUT_FILE)
    print(f"Loaded {len(df)} rows × {len(df.columns)} columns")

    # --- Normalize date columns to ISO string ---
    date_cols = [
        "Posting Date", "Vendor Inv DT", "Payment Date",
        "Inoice Entry Date", "Comparison Date", "Clearing Date"
    ]
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce").dt.strftime("%Y-%m-%d")
            df[col] = df[col].fillna("")

    # --- Convert numeric ID fields to clean strings (remove ".0") ---
    id_cols = ["Doc No", "Clearing Document No", "Company Code", "Plant Code",
               "Vendor Code", "Material Code", "IGST GL", "CGST GL", "SGST GL",
               "Cess GL", "Profit Centre", "Cost centre", "Valuation Area",
               "Group Indicator", "GST Partner"]
    for col in id_cols:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda x: str(int(x)) if pd.notna(x) and x != "" and str(x).replace(".", "").replace("-", "").isdigit()
                else (str(x) if pd.notna(x) else "")
            )

    # --- Fill remaining NaN ---
    for col in df.columns:
        if df[col].dtype in ["float64", "int64"]:
            df[col] = df[col].fillna(0)
        else:
            df[col] = df[col].fillna("")

    records = df.to_dict(orient="records")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({"data": records}, f, ensure_ascii=False, default=str)

    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"\nDone! Output: {OUTPUT_FILE}")
    print(f"Records: {len(records):,}  |  File size: {size_mb:.2f} MB")

if __name__ == "__main__":
    convert()