sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/CheckBox",
    "sap/m/ScrollContainer",
    "sap/m/MessageToast",
    "sap/m/Title",
    "sap/ui/core/Item",
    "sap/ui/core/Icon"
], function (
    Controller, JSONModel, Filter, FilterOperator,
    Column, Text, Label, Dialog, Button, VBox, HBox,
    CheckBox, ScrollContainer, MessageToast, Title, Item, Icon
) {
    "use strict";

    var _aColumnDefs = [
        { field: "Our GSTIN",                         label: "Our GSTIN",                     width: "190px", visible: true  },
        { field: "Fiscal Year",                       label: "Fiscal Year",                   width: "105px", visible: true  },
        { field: "Company Code",                      label: "Company Code",                  width: "130px", visible: true  },
        { field: "Doc No",                            label: "Doc No",                        width: "130px", visible: true  },
        { field: "Business Area",                     label: "Business Area",                 width: "125px", visible: true  },
        { field: "Business Place",                    label: "Business Place",                width: "130px", visible: true  },
        { field: "Plant Code",                        label: "Plant Code",                    width: "110px", visible: true  },
        { field: "Vendor Code",                       label: "Vendor Code",                   width: "120px", visible: true  },
        { field: "Vendor name",                       label: "Vendor Name",                   width: "220px", visible: true  },
        { field: "Vendor GSTIN",                      label: "Vendor GSTIN",                  width: "190px", visible: true  },
        { field: "Vendor PAN",                        label: "Vendor PAN",                    width: "130px", visible: true  },
        { field: "Tax code Description",              label: "Tax Code Desc.",                width: "160px", visible: true  },
        { field: "Total Tax Rate",                    label: "Total Tax Rate",                width: "125px", visible: true  },
        { field: "Total Tax Value Including Cess",    label: "Total Tax Value (Incl. Cess)",  width: "215px", visible: true  },
        { field: "Taxable Value",                     label: "Taxable Value",                 width: "140px", visible: true  },
        { field: "IGST Rate",                         label: "IGST Rate",                     width: "105px", visible: true  },
        { field: "IGST Amount",                       label: "IGST Amount",                   width: "130px", visible: true  },
        { field: "IGST GL",                           label: "IGST GL",                       width: "120px", visible: true  },
        { field: "Plant Description",                 label: "Plant Description",             width: "170px", visible: false },
        { field: "Posting Date",                      label: "Posting Date",                  width: "130px", visible: false },
        { field: "Doc Type Description",              label: "Doc Type",                      width: "160px", visible: false },
        { field: "Inv Type",                          label: "Invoice Type",                  width: "120px", visible: false },
        { field: "Vendor GST Class",                  label: "Vendor GST Class",              width: "145px", visible: false },
        { field: "Vendor GST e-inv Status",           label: "e-Inv Status",                  width: "130px", visible: false },
        { field: "Supplier State Code SAP",           label: "Supplier State Code",           width: "165px", visible: false },
        { field: "Supplier State Name SAP",           label: "Supplier State Name",           width: "175px", visible: false },
        { field: "Vendor Inv DT",                     label: "Vendor Inv Date",               width: "140px", visible: false },
        { field: "Vendor Inv No",                     label: "Vendor Inv No",                 width: "145px", visible: false },
        { field: "ITC Eligibility",                   label: "ITC Eligibility",               width: "135px", visible: false },
        { field: "RCM (Y/N)",                         label: "RCM",                           width: "80px",  visible: false },
        { field: "RCM Self Inv Number",               label: "RCM Self Inv No",               width: "155px", visible: false },
        { field: "CGST Rate",                         label: "CGST Rate",                     width: "105px", visible: false },
        { field: "CGST Amount",                       label: "CGST Amount",                   width: "130px", visible: false },
        { field: "CGST GL",                           label: "CGST GL",                       width: "120px", visible: false },
        { field: "SGST Rate",                         label: "SGST Rate",                     width: "105px", visible: false },
        { field: "SGST Amount",                       label: "SGST Amount",                   width: "130px", visible: false },
        { field: "SGST GL",                           label: "SGST GL",                       width: "120px", visible: false },
        { field: "Cess Rate",                         label: "Cess Rate",                     width: "105px", visible: false },
        { field: "Cess GL",                           label: "Cess GL",                       width: "120px", visible: false },
        { field: "Import Service",                    label: "Import Service",                width: "130px", visible: false },
        { field: "IMPORT GST Rate",                   label: "Import GST Rate",               width: "145px", visible: false },
        { field: "IMPORT GST GL",                     label: "Import GST GL",                 width: "135px", visible: false },
        { field: "IMPORT CESS Rate",                  label: "Import Cess Rate",              width: "145px", visible: false },
        { field: "IMPORT Cess GL",                    label: "Import Cess GL",                width: "135px", visible: false },
        { field: "RCM IGST Rate",                     label: "RCM IGST Rate",                 width: "135px", visible: false },
        { field: "RCM IGST Amount",                   label: "RCM IGST Amount",               width: "145px", visible: false },
        { field: "RCM IGST GL",                       label: "RCM IGST GL",                   width: "125px", visible: false },
        { field: "RCM CGST Rate",                     label: "RCM CGST Rate",                 width: "135px", visible: false },
        { field: "RCM CGST Amount",                   label: "RCM CGST Amount",               width: "145px", visible: false },
        { field: "RCM CGST GL",                       label: "RCM CGST GL",                   width: "125px", visible: false },
        { field: "RCM SGST Rate",                     label: "RCM SGST Rate",                 width: "135px", visible: false },
        { field: "RCM SGST Amount",                   label: "RCM SGST Amount",               width: "145px", visible: false },
        { field: "RCM SGST GL",                       label: "RCM SGST GL",                   width: "125px", visible: false },
        { field: "RCM Cess Rate",                     label: "RCM Cess Rate",                 width: "130px", visible: false },
        { field: "RCM Cess GL",                       label: "RCM Cess GL",                   width: "125px", visible: false },
        { field: "Total Invoice Value",               label: "Total Invoice Value",           width: "165px", visible: false },
        { field: "Freight Amount",                    label: "Freight Amount",                width: "135px", visible: false },
        { field: "Currency",                          label: "Currency",                      width: "95px",  visible: false },
        { field: "Goods/Services",                    label: "Goods/Services",                width: "135px", visible: false },
        { field: "GST POS Code",                      label: "GST POS Code",                  width: "125px", visible: false },
        { field: "GST POS name",                      label: "GST POS Name",                  width: "155px", visible: false },
        { field: "HSN/SAC",                           label: "HSN/SAC",                       width: "125px", visible: false },
        { field: "HSN/SAC Description",               label: "HSN/SAC Description",           width: "210px", visible: false },
        { field: "Header Text",                       label: "Header Text",                   width: "185px", visible: false },
        { field: "Material Code",                     label: "Material Code",                 width: "145px", visible: false },
        { field: "Material Text",                     label: "Material Text",                 width: "210px", visible: false },
        { field: "Non Deductable tax Amount",         label: "Non-Deductible Tax Amt",        width: "195px", visible: false },
        { field: "Text",                              label: "Text",                          width: "155px", visible: false },
        { field: "Non Deductable tax rate",           label: "Non-Deductible Tax Rate",       width: "195px", visible: false },
        { field: "TCS Amount",                        label: "TCS Amount",                    width: "125px", visible: false },
        { field: "TCS%",                              label: "TCS%",                          width: "85px",  visible: false },
        { field: "Group Indicator",                   label: "Group Indicator",               width: "135px", visible: false },
        { field: "GST Partner",                       label: "GST Partner",                   width: "125px", visible: false },
        { field: "House bank",                        label: "House Bank",                    width: "125px", visible: false },
        { field: "Payment Date",                      label: "Payment Date",                  width: "135px", visible: false },
        { field: "Payment Bank Name",                 label: "Payment Bank Name",             width: "175px", visible: false },
        { field: "Profit Centre",                     label: "Profit Centre",                 width: "130px", visible: false },
        { field: "Cost centre",                       label: "Cost Centre",                   width: "125px", visible: false },
        { field: "Cost centre Name",                  label: "Cost Centre Name",              width: "165px", visible: false },
        { field: "Expense GL Desc",                   label: "Expense GL Desc",               width: "185px", visible: false },
        { field: "Valuation Area",                    label: "Valuation Area",                width: "135px", visible: false },
        { field: "WBS Element",                       label: "WBS Element",                   width: "135px", visible: false },
        { field: "FI User Login id",                  label: "FI User Login ID",              width: "155px", visible: false },
        { field: "FI User Name",                      label: "FI User Name",                  width: "155px", visible: false },
        { field: "Inoice Entry Date",                 label: "Invoice Entry Date",            width: "155px", visible: false },
        { field: "Reversal Ref",                      label: "Reversal Ref",                  width: "135px", visible: false },
        { field: "Reversed",                          label: "Reversed",                      width: "105px", visible: false },
        { field: "Reversing Doc",                     label: "Reversing Doc",                 width: "135px", visible: false },
        { field: "Number of Days",                    label: "Number of Days",                width: "135px", visible: false },
        { field: "Comparison Date",                   label: "Comparison Date",               width: "145px", visible: false },
        { field: "Clearing Date",                     label: "Clearing Date",                 width: "135px", visible: false },
        { field: "Clearing Document No",              label: "Clearing Doc No",               width: "155px", visible: false }
    ];

    return Controller.extend("gstpr.zfigstpregister.controller.Home", {

        // ── Lifecycle ──────────────────────────────────────────────────
        onInit: function () {
            this._oGstModel      = new JSONModel();
            this._oAnalysisModel = new JSONModel();
            this._oActiveDrillFilter = null; // track active drill-down filter

            this.getView().setModel(this._oGstModel,      "gstData");
            this.getView().setModel(this._oAnalysisModel, "gstAnalysis");

            this._loadData();
            this._loadAnalysis();
        },

        // ── Data loading ───────────────────────────────────────────────
        _loadData: function () {
            var sUrl = sap.ui.require.toUrl(
                "gstpr/zfigstpregister/model/data/gst_data.json"
            );
            this._oGstModel.loadData(sUrl)
                .then(this._onDataLoaded.bind(this))
                .catch(function () {
                    this.byId("txtRecordCount").setText(
                        "⚠ gst_data.json not found — run scripts/convert_excel_to_json.py first."
                    );
                }.bind(this));
        },

        _loadAnalysis: function () {
            var sUrl = sap.ui.require.toUrl(
                "gstpr/zfigstpregister/model/data/gst_analysis.json"
            );
            this._oAnalysisModel.loadData(sUrl).catch(function () {});
        },

        _onDataLoaded: function () {
            this._buildTable();
            this._populateFilterDropdowns();
            this._updateRecordCount();
        },

        // ── Build table ────────────────────────────────────────────────
        _buildTable: function () {
            var oTable = this.byId("gstTable");
            oTable.destroyColumns();

            _aColumnDefs.forEach(function (oDef) {
                oTable.addColumn(new Column({
                    label:          new Label({ text: oDef.label }),
                    template:       new Text({
                                        text:     "{gstData>" + oDef.field + "}",
                                        wrapping: false
                                    }),
                    width:          oDef.width,
                    visible:        oDef.visible,
                    autoResizable:  true,
                    sortProperty:   oDef.field,
                    filterProperty: oDef.field
                }));
            });

            oTable.bindRows("gstData>/data");
        },

        // ── Populate dropdowns ─────────────────────────────────────────
        _populateFilterDropdowns: function () {
            var aData = this._oGstModel.getProperty("/data") || [];

            var fnFill = function (sId, sField) {
                var oCombo = this.byId(sId);
                var aVals  = Array.from(
                    new Set(
                        aData
                            .map(function (r) { return String(r[sField] || ""); })
                            .filter(function (v) { return v && v !== "0"; })
                    )
                ).sort();
                aVals.forEach(function (v) {
                    oCombo.addItem(new Item({ key: v, text: v }));
                });
            }.bind(this);

            fnFill("filterCompanyCode",   "Company Code");
            fnFill("filterBusinessArea",  "Business Area");
            fnFill("filterBusinessPlace", "Business Place");
        },

        // ── Record count ───────────────────────────────────────────────
        _updateRecordCount: function () {
            var oBinding = this.byId("gstTable").getBinding("rows");
            var iTotal   = (this._oGstModel.getProperty("/data") || []).length;
            var iShown   = oBinding ? oBinding.getLength() : iTotal;
            this.byId("txtRecordCount").setText(
                "Showing " + iShown.toLocaleString("en-IN") +
                " of " + iTotal.toLocaleString("en-IN") + " records"
            );
        },

        // ── Filter bar: Go ─────────────────────────────────────────────
        onGo: function () {
            // clear any active drill-down when user manually filters
            this._clearDrillDownBadge();
            this._applyFilterBarFilters();
        },

        _applyFilterBarFilters: function () {
            var aFilters = [];

            var sCC = this.byId("filterCompanyCode").getSelectedKey();
            if (sCC) aFilters.push(new Filter("Company Code", FilterOperator.EQ, sCC));

            var sDocNo = this.byId("filterDocNo").getValue().trim();
            if (sDocNo) aFilters.push(new Filter("Doc No", FilterOperator.Contains, sDocNo));

            var sBA = this.byId("filterBusinessArea").getSelectedKey();
            if (sBA) aFilters.push(new Filter("Business Area", FilterOperator.EQ, sBA));

            var sBP = this.byId("filterBusinessPlace").getSelectedKey();
            if (sBP) aFilters.push(new Filter("Business Place", FilterOperator.EQ, sBP));

            var sFrom = this.byId("filterDateFrom").getValue();
            var sTo   = this.byId("filterDateTo").getValue();
            if (sFrom && sTo) {
                aFilters.push(new Filter("Posting Date", FilterOperator.BT, sFrom, sTo));
            } else if (sFrom) {
                aFilters.push(new Filter("Posting Date", FilterOperator.GE, sFrom));
            } else if (sTo) {
                aFilters.push(new Filter("Posting Date", FilterOperator.LE, sTo));
            }

            var oBinding = this.byId("gstTable").getBinding("rows");
            if (oBinding) {
                oBinding.filter(
                    aFilters.length ? new Filter({ filters: aFilters, and: true }) : []
                );
                setTimeout(this._updateRecordCount.bind(this), 150);
            }
        },

        // ── Filter bar: Reset ──────────────────────────────────────────
        onReset: function () {
            this.byId("filterCompanyCode").setSelectedKey("");
            this.byId("filterDocNo").setValue("");
            this.byId("filterBusinessArea").setSelectedKey("");
            this.byId("filterBusinessPlace").setSelectedKey("");
            this.byId("filterDateFrom").setValue("");
            this.byId("filterDateTo").setValue("");
            this._clearDrillDownBadge();

            var oBinding = this.byId("gstTable").getBinding("rows");
            if (oBinding) {
                oBinding.filter([]);
                setTimeout(this._updateRecordCount.bind(this), 150);
            }
        },

        // ── AI Summary: open/close ─────────────────────────────────────
        onAnalyse: function () {
            var oPanel = this.byId("aiSummaryPanel");
            oPanel.setVisible(!oPanel.getVisible());
            if (oPanel.getVisible()) {
                this._renderAnalysis();
            }
        },

        onCloseAnalysis: function () {
            this.byId("aiSummaryPanel").setVisible(false);
        },

        // ── AI Summary: render ─────────────────────────────────────────
        _renderAnalysis: function () {
            var oContainer = this.byId("aiSummaryContent");
            oContainer.destroyItems();

            var oData = this._oAnalysisModel.getData();
            if (!oData || !oData.insights || !oData.insights.length) {
                var oMsg = new Text({
                    text: "No analysis found. Run scripts/analyze_gst_data.py to generate insights."
                });
                oMsg.addStyleClass("sapUiSmallMargin");
                oContainer.addItem(oMsg);
                return;
            }

            // ── KPI metrics row ─────────────────────────────────────────
            var m    = oData.metrics || {};
            var aKpi = [
                { label: "Total Records",  value: (m.totalRecords  || 0).toLocaleString("en-IN") },
                { label: "Invoice Value",  value: m.totalInvoiceValueFormatted  || "—" },
                { label: "Taxable Value",  value: m.totalTaxableValueFormatted  || "—" },
                { label: "Total Tax",      value: m.totalTaxValueFormatted       || "—" },
                { label: "IGST",           value: m.igstFormatted                || "—" },
                { label: "CGST",           value: m.cgstFormatted                || "—" },
                { label: "SGST",           value: m.sgstFormatted                || "—" },
                { label: "Vendors",        value: (m.uniqueVendors || 0).toLocaleString("en-IN") },
                { label: "ITC Eligible",   value: (m.itcEligibleRecords || 0).toLocaleString("en-IN") }
            ];

            var oMetricsRow = new HBox({ wrap: "Wrap" });
            oMetricsRow.addStyleClass("aiMetricsRow");

            aKpi.forEach(function (oK) {
                var oLbl = new Label({ text: oK.label });
                oLbl.addStyleClass("aiMetricLabel");
                var oVal = new Title({ text: oK.value, titleStyle: "H6" });
                oVal.addStyleClass("aiMetricValue");
                var oCard = new VBox({ items: [oLbl, oVal] });
                oCard.addStyleClass("aiMetricCard");
                oMetricsRow.addItem(oCard);
            });

            oContainer.addItem(oMetricsRow);

            // ── Insight bullets — now clickable ─────────────────────────
            var that = this;
            oData.insights.forEach(function (oI) {
                var sIconSrc = oI.severity === "critical" ? "sap-icon://error"
                             : oI.severity === "warning"  ? "sap-icon://warning2"
                             :                              "sap-icon://information";
                var sColor   = oI.severity === "critical" ? "#bb0000"
                             : oI.severity === "warning"  ? "#c44500"
                             :                              "#0064d9";

                var oIcon = new Icon({ src: sIconSrc, color: sColor, size: "1rem" });
                oIcon.addStyleClass("aiInsightIcon");

                var oTxt = new Text({ text: oI.text });
                oTxt.addStyleClass("aiInsightText");

                // Drill-down arrow indicator (only for insights with a filter)
                var oDrillHint = new Text({ text: "↗ Click to view records" });
                oDrillHint.addStyleClass("aiInsightDrillHint");

                var oTextBox = new VBox({ items: [oTxt, oDrillHint] });

                var oRow = new HBox({ alignItems: "Start", items: [oIcon, oTextBox] });
                oRow.addStyleClass("aiInsightRow");
                oRow.addStyleClass("aiInsight-" + oI.severity);

                // Make clickable if insight has filterParams
                if (oI.filterParams && oI.filterId) {
                    oRow.addStyleClass("aiInsightClickable");
                    // Capture oI in closure
                    (function (oInsight) {
                        oRow.attachBrowserEvent("click", function () {
                            that._applyDrillDown(oInsight);
                        });
                    })(oI);
                } else {
                    oDrillHint.setVisible(false);
                }

                oContainer.addItem(oRow);
            });

            // ── Timestamp ───────────────────────────────────────────────
            if (oData.generatedAt) {
                var oTs = new Text({ text: "Analysis generated: " + oData.generatedAt });
                oTs.addStyleClass("aiTimestamp");
                oContainer.addItem(oTs);
            }
        },

        // ── DRILL-DOWN: build and apply filter from insight ────────────
        _applyDrillDown: function (oInsight) {
            var oParams  = oInsight.filterParams;
            var sField   = oParams.field;
            var oFilter  = null;
            var aData    = this._oGstModel.getProperty("/data") || [];

            switch (oParams.operator) {
                case "isEmpty":
                    // Client-side: collect keys of matching records
                    var aEmpty = aData
                        .filter(function (r) {
                            var v = String(r[sField] || "").trim();
                            return v === "" || v === "nan" || v === "0";
                        })
                        .map(function (r) { return r["Doc No"]; });

                    // Use OR filter across matching Doc Nos
                    if (aEmpty.length) {
                        var aDocFilters = aEmpty.map(function (docNo) {
                            return new Filter("Doc No", FilterOperator.EQ, String(docNo));
                        });
                        oFilter = new Filter({ filters: aDocFilters, and: false });
                    }
                    break;

                case "notEmpty":
                    var aNotEmpty = aData
                        .filter(function (r) {
                            var v = String(r[sField] || "").trim();
                            return v !== "" && v !== "nan" && v !== "0";
                        })
                        .map(function (r) { return r["Doc No"]; });

                    if (aNotEmpty.length) {
                        var aNotDocFilters = aNotEmpty.map(function (docNo) {
                            return new Filter("Doc No", FilterOperator.EQ, String(docNo));
                        });
                        oFilter = new Filter({ filters: aNotDocFilters, and: false });
                    }
                    break;

                case "EQ":
                    oFilter = new Filter(sField, FilterOperator.EQ, oParams.value);
                    break;

                case "GT":
                    oFilter = new Filter(sField, FilterOperator.GT, parseFloat(oParams.value));
                    break;

                case "IN":
                    var aInFilters = (oParams.values || []).map(function (v) {
                        return new Filter(sField, FilterOperator.EQ, v);
                    });
                    if (aInFilters.length) {
                        oFilter = new Filter({ filters: aInFilters, and: false });
                    }
                    break;

                default:
                    oFilter = null;
            }

            var oBinding = this.byId("gstTable").getBinding("rows");
            if (oBinding && oFilter) {
                oBinding.filter(oFilter);
                this._oActiveDrillFilter = oFilter;
                this._showDrillDownBadge(oInsight.filterLabel);
                setTimeout(this._updateRecordCount.bind(this), 150);

                // Scroll table into view smoothly
                var oDomTable = this.byId("gstTable").getDomRef();
                if (oDomTable) {
                    oDomTable.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        },

        // ── DRILL-DOWN: badge bar ──────────────────────────────────────
        _showDrillDownBadge: function (sLabel) {
            this.byId("drillDownBadgeBar").setVisible(true);
            this.byId("drillDownBadgeText").setText("Filtered: " + sLabel);
        },

        _clearDrillDownBadge: function () {
            this.byId("drillDownBadgeBar").setVisible(false);
            this.byId("drillDownBadgeText").setText("");
            this._oActiveDrillFilter = null;
        },

        onClearDrillDown: function () {
            this._clearDrillDownBadge();
            var oBinding = this.byId("gstTable").getBinding("rows");
            if (oBinding) {
                oBinding.filter([]);
                setTimeout(this._updateRecordCount.bind(this), 150);
            }
        },

        // ── Column Settings ────────────────────────────────────────────
        onColumnSettings: function () {
            if (!this._oColDialog) {
                this._buildColDialog();
            }
            this._syncCheckboxes();
            this._oColDialog.open();
        },

        _buildColDialog: function () {
            var oVBox = new VBox({ id: this.createId("colCbContainer") });

            _aColumnDefs.forEach(function (oDef, i) {
                oVBox.addItem(new CheckBox({
                    id:       this.createId("colCb_" + i),
                    text:     oDef.label,
                    selected: oDef.visible
                }));
            }.bind(this));

            this._oColDialog = new Dialog({
                title:        "Column Visibility",
                contentWidth: "360px",
                content: [
                    new ScrollContainer({
                        height:   "480px",
                        vertical: true,
                        content:  [oVBox]
                    })
                ],
                beginButton: new Button({
                    text:  "Apply",
                    type:  "Emphasized",
                    press: function () {
                        this._applyColumns();
                        this._oColDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text:  "Cancel",
                    press: function () { this._oColDialog.close(); }.bind(this)
                })
            });

            this.getView().addDependent(this._oColDialog);
        },

        _syncCheckboxes: function () {
            var aCols = this.byId("gstTable").getColumns();
            _aColumnDefs.forEach(function (oDef, i) {
                var oCb = this.byId("colCb_" + i);
                if (oCb && aCols[i]) oCb.setSelected(aCols[i].getVisible());
            }.bind(this));
        },

        _applyColumns: function () {
            var aCols = this.byId("gstTable").getColumns();
            _aColumnDefs.forEach(function (oDef, i) {
                var oCb = this.byId("colCb_" + i);
                if (oCb && aCols[i]) aCols[i].setVisible(oCb.getSelected());
            }.bind(this));
            MessageToast.show("Column visibility updated.");
        }
    });
});