import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Trash2, HelpCircle, AlertCircle, Sparkles, Database, FileText, CheckCircle, Search } from "lucide-react";
import { SalesDataset, RegionData, CategorySales, MonthlyTrend, StorePerformance, StoreMasterRecord, SalesRow } from "../types";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";

interface DataUploaderProps {
  onDatasetLoaded: (dataset: SalesDataset) => void;
  onResetDefault: () => void;
  currentDatasetName: string;
  storeMasterRecords: StoreMasterRecord[];
  onStoreMasterLoaded: (records: StoreMasterRecord[]) => void;
  onResetStoreMaster: () => void;
}

export default function DataUploader({
  onDatasetLoaded,
  onResetDefault,
  currentDatasetName,
  storeMasterRecords,
  onStoreMasterLoaded,
  onResetStoreMaster
}: DataUploaderProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "store_master">("sales");
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [storeSearch, setStoreSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse custom Store Master CSV
  const processStoreMasterCSV = (text: string, filename: string) => {
    try {
      // Strip UTF-8 BOM if present
      const cleanText = text.replace(/^\uFEFF/, "");
      const lines = cleanText.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("Store master CSV must have a header line and at least one data row.");
      }

      const rawHeader = lines[0];
      
      // Auto-detect delimiter
      let delimiter = ",";
      const commaCount = (rawHeader.match(/,/g) || []).length;
      const semicolonCount = (rawHeader.match(/;/g) || []).length;
      const tabCount = (rawHeader.match(/\t/g) || []).length;
      if (semicolonCount > commaCount && semicolonCount > tabCount) {
        delimiter = ";";
      } else if (tabCount > commaCount && tabCount > semicolonCount) {
        delimiter = "\t";
      }

      const headers = rawHeader.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

      const storeIdIdx = headers.indexOf("store_id") !== -1 ? headers.indexOf("store_id") : headers.indexOf("id");
      const storeNameIdx = headers.indexOf("store_name") !== -1 ? headers.indexOf("store_name") : headers.indexOf("name");
      const regionIdx = headers.indexOf("region");
      const cityIdx = headers.indexOf("city");
      const formatIdx = headers.indexOf("store_format") !== -1 ? headers.indexOf("store_format") : headers.indexOf("format");

      if (storeIdIdx === -1 || storeNameIdx === -1) {
        throw new Error(`Missing critical columns. Detected headers in CSV: [${headers.join(", ")}]. Store Master CSV must contain at least 'store_id' and 'store_name'.`);
      }

      const records: StoreMasterRecord[] = [];
      const escapedDelimiter = delimiter === "\t" ? "\\t" : delimiter;
      const splitRegex = new RegExp(`${escapedDelimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = line.split(splitRegex).map(cell => cell.trim().replace(/^["']|["']$/g, ""));
        if (row.length < Math.max(storeIdIdx, storeNameIdx) + 1) continue;

        const storeId = row[storeIdIdx];
        const storeName = row[storeNameIdx];
        const region = regionIdx !== -1 ? row[regionIdx] : "Unassigned";
        const city = cityIdx !== -1 ? row[cityIdx] : "Unknown";
        const storeFormat = formatIdx !== -1 ? row[formatIdx] : "Standard";

        if (storeId && storeName) {
          records.push({
            storeId,
            storeName,
            region,
            city,
            storeFormat
          });
        }
      }

      if (records.length === 0) {
        throw new Error("No valid store master records could be parsed.");
      }

      onStoreMasterLoaded(records);
      setSuccessMsg(`Store Master "${filename}" integrated! ${records.length} franchise locations registered.`);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse Store Master CSV.");
      setSuccessMsg(null);
    }
  };

  // Parse custom weekly sales CSV string into a structured dataset
  const processCSVText = (text: string, filename: string) => {
    try {
      // Strip UTF-8 BOM if present
      const cleanText = text.replace(/^\uFEFF/, "");
      const lines = cleanText.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("CSV file must have a header line and at least one data row.");
      }

      // Read header
      const rawHeader = lines[0];
      
      // Auto-detect delimiter
      let delimiter = ",";
      const commaCount = (rawHeader.match(/,/g) || []).length;
      const semicolonCount = (rawHeader.match(/;/g) || []).length;
      const tabCount = (rawHeader.match(/\t/g) || []).length;
      if (semicolonCount > commaCount && semicolonCount > tabCount) {
        delimiter = ";";
      } else if (tabCount > commaCount && tabCount > semicolonCount) {
        delimiter = "\t";
      }

      const headers = rawHeader.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

      // Column mapping indices
      const regionIdx = headers.indexOf("region");
      const categoryIdx = headers.indexOf("product_category") !== -1 ? headers.indexOf("product_category") : headers.indexOf("category");
      
      // Determine Sales Index
      const netSalesIdx = headers.indexOf("net_sales");
      const grossSalesIdx = headers.indexOf("gross_sales");
      const salesIdx = headers.indexOf("sales");
      const salesColumnIndex = netSalesIdx !== -1 ? netSalesIdx : (grossSalesIdx !== -1 ? grossSalesIdx : salesIdx);

      // Determine Transactions Index
      const transIdx = headers.indexOf("transactions");
      
      // Secondary fields
      const storeIdIdx = headers.indexOf("store_id") !== -1 ? headers.indexOf("store_id") : headers.indexOf("id");
      const storeIdx = headers.indexOf("store_name") !== -1 ? headers.indexOf("store_name") : headers.indexOf("store");
      const dateIdx = headers.indexOf("week_start_date") !== -1 ? headers.indexOf("week_start_date") : headers.indexOf("date");
      const footfallIdx = headers.indexOf("footfall");
      const targetIdx = headers.indexOf("sales_target");
      const discountIdx = headers.indexOf("discount_amount");
      const returnIdx = headers.indexOf("returns_amount");
      const ratingIdx = headers.indexOf("customer_rating");
      const stockoutsIdx = headers.indexOf("stockouts");
      const marketingIdx = headers.indexOf("marketing_spend");
      const formatIdx = headers.indexOf("store_format");
      const cityIdx = headers.indexOf("city");
      const unitsIdx = headers.indexOf("units_sold");

      if (salesColumnIndex === -1 || categoryIdx === -1) {
        throw new Error(`Missing critical columns. Detected headers in CSV: [${headers.join(", ")}]. Excel CSV must contain at least: 'product_category' (or 'category') and 'net_sales' (or 'sales').`);
      }

      // Group rows by Region
      const regionGroups: Record<string, {
        sales: number;
        transactions: number;
        footfall: number;
        target: number;
        discount: number;
        returns: number;
        ratings: number[];
        stockouts: number;
        marketing: number;
        categories: Record<string, { sales: number; transactions: number; units: number }>;
        months: Record<string, { sales: number; transactions: number; footfall: number; target: number }>;
        stores: Record<string, {
          sales: number;
          transactions: number;
          footfall: number;
          target: number;
          discount: number;
          returns: number;
          ratings: number[];
          stockouts: number;
          city: string;
          format: string;
        }>;
      }> = {};

      const rawRowsList: SalesRow[] = [];

      const escapedDelimiter = delimiter === "\t" ? "\\t" : delimiter;
      const splitRegex = new RegExp(`${escapedDelimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Splitting with regex to respect delimiter inside quoted fields (such as store names like "Midtown, NY")
        const row = line.split(splitRegex).map(cell => cell.trim().replace(/^["']|["']$/g, ""));
        if (row.length < headers.length) continue;

        // Fetch Store ID for joining
        const storeIdVal = storeIdIdx !== -1 ? row[storeIdIdx] : "";
        
        // Lookup matching record in store master database lookup table if present
        const masterRecord = storeIdVal ? storeMasterRecords.find(m => m.storeId.toLowerCase() === storeIdVal.toLowerCase()) : null;

        const region = masterRecord?.region || (regionIdx !== -1 ? row[regionIdx] : "General Region") || "General Region";
        const category = row[categoryIdx] || "General Merchandise";
        const sales = parseFloat(row[salesColumnIndex]) || 0;
        const transactions = transIdx !== -1 ? parseInt(row[transIdx]) || 0 : Math.round(sales / 45) || 1;
        
        const store = masterRecord?.storeName || (storeIdx !== -1 ? row[storeIdx] : (storeIdVal ? `Store ${storeIdVal}` : `${region} Store Outlet`));
        const dateStr = dateIdx !== -1 ? row[dateIdx] : "Jul 26";
        const footfall = footfallIdx !== -1 ? parseFloat(row[footfallIdx]) || 0 : Math.round(transactions * 5);
        const target = targetIdx !== -1 ? parseFloat(row[targetIdx]) || sales : sales;
        const discount = discountIdx !== -1 ? parseFloat(row[discountIdx]) || 0 : 0;
        const returns = returnIdx !== -1 ? parseFloat(row[returnIdx]) || 0 : 0;
        const rating = ratingIdx !== -1 ? parseFloat(row[ratingIdx]) || 0 : 4.2;
        const stockouts = stockoutsIdx !== -1 ? parseFloat(row[stockoutsIdx]) || 0 : 0;
        const marketing = marketingIdx !== -1 ? parseFloat(row[marketingIdx]) || 0 : 0;
        const storeFormat = masterRecord?.storeFormat || (formatIdx !== -1 ? row[formatIdx] : "Standard");
        const city = masterRecord?.city || (cityIdx !== -1 ? row[cityIdx] : "");
        const units = unitsIdx !== -1 ? parseFloat(row[unitsIdx]) || transactions : transactions;

        // Initialize region group if needed
        if (!regionGroups[region]) {
          regionGroups[region] = {
            sales: 0,
            transactions: 0,
            footfall: 0,
            target: 0,
            discount: 0,
            returns: 0,
            ratings: [],
            stockouts: 0,
            marketing: 0,
            categories: {},
            months: {},
            stores: {}
          };
        }

        const rg = regionGroups[region];
        rg.sales += sales;
        rg.transactions += transactions;
        rg.footfall += footfall;
        rg.target += target;
        rg.discount += discount;
        rg.returns += returns;
        if (rating > 0) rg.ratings.push(rating);
        rg.stockouts += stockouts;
        rg.marketing += marketing;

        // Map Category breakdown
        if (!rg.categories[category]) {
          rg.categories[category] = { sales: 0, transactions: 0, units: 0 };
        }
        rg.categories[category].sales += sales;
        rg.categories[category].transactions += transactions;
        rg.categories[category].units += units;

        // Map Trend (monthly or weekly)
        let displayMonth = dateStr;
        if (dateStr.includes("-") && dateStr.length >= 10) {
          try {
            const parts = dateStr.split("-");
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const yearStr = parts[0].slice(2);
            const mIndex = parseInt(parts[1]) - 1;
            if (mIndex >= 0 && mIndex < 12) {
              displayMonth = `${months[mIndex]} ${parts[2] || yearStr}`;
            }
          } catch(e) {}
        }

        if (!rg.months[displayMonth]) {
          rg.months[displayMonth] = { sales: 0, transactions: 0, footfall: 0, target: 0 };
        }
        rg.months[displayMonth].sales += sales;
        rg.months[displayMonth].transactions += transactions;
        rg.months[displayMonth].footfall += footfall;
        rg.months[displayMonth].target += target;

        // Map Store performance nested
        if (!rg.stores[store]) {
          rg.stores[store] = {
            sales: 0,
            transactions: 0,
            footfall: 0,
            target: 0,
            discount: 0,
            returns: 0,
            ratings: [],
            stockouts: 0,
            city,
            format: storeFormat
          };
        }
        const st = rg.stores[store];
        st.sales += sales;
        st.transactions += transactions;
        st.footfall += footfall;
        st.target += target;
        st.discount += discount;
        st.returns += returns;
        if (rating > 0) st.ratings.push(rating);
        st.stockouts += stockouts;

        rawRowsList.push({
          week: displayMonth,
          region,
          storeName: store,
          city: city || "Various",
          storeFormat: storeFormat || "Standard",
          category,
          sales: Math.round(sales),
          transactions,
          footfall,
          target: Math.round(target),
          discount: Math.round(discount),
          returns: Math.round(returns),
          rating: rating > 0 ? rating : 4.2,
          stockouts,
          marketingSpend: Math.round(marketing),
          unitsSold: Math.round(units)
        });
      }

      // Convert Region Groups map into final RegionData array
      const regions: RegionData[] = Object.keys(regionGroups).map(regionName => {
        const group = regionGroups[regionName];
        
        // Category list
        const categoryBreakdown: CategorySales[] = Object.keys(group.categories).map(catName => ({
          category: catName,
          sales: Math.round(group.categories[catName].sales),
          transactions: group.categories[catName].transactions,
          unitsSold: group.categories[catName].units
        }));

        // Monthly trends
        const monthlyTrend: MonthlyTrend[] = Object.keys(group.months).map(monthStr => ({
          month: monthStr,
          sales: Math.round(group.months[monthStr].sales),
          transactions: group.months[monthStr].transactions,
          footfall: group.months[monthStr].footfall,
          target: Math.round(group.months[monthStr].target)
        }));

        // Convert store metrics and classify top/low
        const sortedStores: StorePerformance[] = Object.keys(group.stores).map(storeName => {
          const st = group.stores[storeName];
          const avgStoreRating = st.ratings.length > 0 
            ? st.ratings.reduce((s, r) => s + r, 0) / st.ratings.length
            : 4.2;

          return {
            storeName,
            city: st.city || "Various",
            storeFormat: st.format || "Standard",
            sales: Math.round(st.sales),
            transactions: st.transactions,
            footfall: st.footfall,
            conversionRate: st.footfall > 0 ? Math.round((st.transactions / st.footfall) * 1000) / 10 : 0,
            targetAttainment: st.target > 0 ? Math.round((st.sales / st.target) * 1000) / 10 : 100,
            customerRating: Math.round(avgStoreRating * 10) / 10,
            stockouts: st.stockouts,
            growth: st.target > 0 ? Math.round(((st.sales - st.target) / st.target) * 1000) / 10 : 2.5
          };
        }).sort((a, b) => b.sales - a.sales);

        const midPoint = Math.ceil(sortedStores.length / 2);
        const topStores = sortedStores.slice(0, Math.max(1, midPoint));
        const lowStores = sortedStores.slice(Math.max(1, midPoint)).reverse();

        const regionAvgRating = group.ratings.length > 0
          ? group.ratings.reduce((s, r) => s + r, 0) / group.ratings.length
          : 4.2;

        const calculatedAttainment = group.target > 0 ? (group.sales / group.target) * 100 : 100;
        const regionGrowth = group.target > 0 ? ((group.sales - group.target) / group.target) * 100 : 3.2;

        return {
          regionName,
          totalSales: Math.round(group.sales),
          totalTransactions: group.transactions,
          averageOrderValue: group.transactions > 0 ? Math.round((group.sales / group.transactions) * 100) / 100 : 0,
          salesGrowth: Math.round(regionGrowth * 10) / 10,
          
          totalFootfall: group.footfall,
          conversionRate: group.footfall > 0 ? Math.round((group.transactions / group.footfall) * 1000) / 10 : 0,
          targetAttainment: Math.round(calculatedAttainment * 10) / 10,
          totalDiscount: Math.round(group.discount),
          totalReturns: Math.round(group.returns),
          avgRating: Math.round(regionAvgRating * 10) / 10,
          totalStockouts: group.stockouts,
          marketingSpend: Math.round(group.marketing),
          marketingRoi: group.marketing > 0 ? Math.round((group.sales / group.marketing) * 10) / 10 : 0,

          categoryBreakdown,
          monthlyTrend,
          topStores: topStores.slice(0, 3),
          lowStores: lowStores.length > 0 ? lowStores.slice(0, 3) : []
        };
      });

      if (regions.length === 0) {
        throw new Error("No readable regional retail records found.");
      }

      // Dataset overall aggregations
      const totalSales = regions.reduce((acc, r) => acc + r.totalSales, 0);
      const totalTransactions = regions.reduce((acc, r) => acc + r.totalTransactions, 0);
      const totalFootfall = regions.reduce((acc, r) => acc + (r.totalFootfall || 0), 0);
      const totalStockouts = regions.reduce((acc, r) => acc + (r.totalStockouts || 0), 0);
      const totalMarketing = regions.reduce((acc, r) => acc + (r.marketingSpend || 0), 0);
      const totalDiscount = regions.reduce((acc, r) => acc + (r.totalDiscount || 0), 0);
      const avgGrowth = regions.reduce((acc, r) => acc + r.salesGrowth, 0) / regions.length;
      
      const ratingsWeighted = regions.reduce((acc, r) => acc + (r.avgRating || 4.2) * r.totalSales, 0);
      const avgRating = totalSales > 0 ? ratingsWeighted / totalSales : 4.2;

      const dataset: SalesDataset = {
        name: filename.replace(".csv", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) + " (Live)",
        lastUpdated: new Date().toLocaleDateString("en-US", { month: 'long', year: 'numeric' }),
        regions,
        rawRows: rawRowsList,
        aggregateKPIs: {
          totalSales,
          totalTransactions,
          aov: totalTransactions > 0 ? totalSales / totalTransactions : 0,
          avgGrowth: Math.round(avgGrowth * 100) / 100,
          totalFootfall,
          conversionRate: totalFootfall > 0 ? (totalTransactions / totalFootfall) * 100 : 0,
          targetAttainment: regions.reduce((acc, r) => acc + (r.targetAttainment || 100), 0) / regions.length,
          totalStockouts,
          avgRating: Math.round(avgRating * 100) / 100,
          marketingRoi: totalMarketing > 0 ? totalSales / totalMarketing : 0,
          discountPercentage: totalSales > 0 ? (totalDiscount / totalSales) * 100 : 0
        }
      };

      onDatasetLoaded(dataset);
      setSuccessMsg(`Spreadsheet weekly sales successfully integrated! Joined records using store master.`);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Compilation failed. Check that columns are comma separated and format aligns with guidelines.");
      setSuccessMsg(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleUpload = (file: File) => {
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.type.includes("sheet") || file.type.includes("excel") || file.type.includes("vnd.ms-excel") || file.type.includes("officedocument.spreadsheetml.sheet");
    
    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) throw new Error("Could not read Excel file data.");
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          if (workbook.SheetNames.length === 0) {
            throw new Error("The uploaded Excel workbook contains no sheets.");
          }
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          
          if (activeTab === "sales") {
            processCSVText(csvText, file.name);
          } else {
            processStoreMasterCSV(csvText, file.name);
          }
        } catch (err: any) {
          setErrorMsg(`Excel Parse Error: ${err.message || "Failed to process the sheet."}`);
          setSuccessMsg(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Treat as standard text-based CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const text = e.target.result as string;
          
          // Auto-recover if this is actually a binary Excel file masquerading under a CSV extension (very common)
          if (text.startsWith("PK\x03\x04") || text.includes("xl/drawings") || text.includes("[Content_Types].xml") || text.slice(0, 4).startsWith("PK")) {
            try {
              const binaryReader = new FileReader();
              binaryReader.onload = (binEvent) => {
                try {
                  const data = new Uint8Array(binEvent.target?.result as ArrayBuffer);
                  const workbook = XLSX.read(data, { type: "array" });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const csvText = XLSX.utils.sheet_to_csv(worksheet);
                  if (activeTab === "sales") {
                    processCSVText(csvText, file.name);
                  } else {
                    processStoreMasterCSV(csvText, file.name);
                  }
                } catch (innerErr: any) {
                  setErrorMsg(`Excel Auto-recovery Parse Error: ${innerErr.message}`);
                  setSuccessMsg(null);
                }
              };
              binaryReader.readAsArrayBuffer(file);
            } catch (err) {
              setErrorMsg("Binary file signature detected. Please upload valid CSV or Excel files.");
            }
            return;
          }

          if (activeTab === "sales") {
            processCSVText(text, file.name);
          } else {
            processStoreMasterCSV(text, file.name);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Template for Weekly Sales CSV
  const getDummyCSVTemplate = () => {
    const headers = "week_start_date,region,store_id,store_name,city,store_format,product_category,footfall,transactions,units_sold,gross_sales,discount_amount,net_sales,sales_target,inventory_on_hand,stockouts,returns_amount,customer_rating,marketing_spend";
    
    const rows = [
      "2026-07-01,Northeast,ST-101,New York Flagship,New York,Flagship,Electronics,25000,6800,14000,345000,15000,330000,310000,450,2,8500,4.6,8500",
      "2026-07-01,Northeast,ST-101,New York Flagship,New York,Flagship,Apparel,25000,8200,18000,210000,10000,200000,195000,900,1,3400,4.5,4200",
      "2026-07-01,Midwest,ST-204,Chicago Hub,Chicago,Flagship,Electronics,32000,5400,11000,280000,18000,262000,280000,310,6,12000,4.2,7500",
      "2026-07-01,Midwest,ST-204,Chicago Hub,Chicago,Flagship,Home & Kitchen,32000,4800,9500,180000,12000,168000,175000,620,4,4800,4.0,3100",
      "2026-07-01,South,ST-302,Dallas Galleria,Dallas,High Street,Electronics,38000,8900,19500,460000,25000,435000,390000,500,0,11000,4.8,9000",
      "2026-07-01,South,ST-302,Dallas Galleria,Dallas,High Street,Beauty,38000,4200,8000,125000,5000,120000,115000,1200,1,1800,4.6,2500",
      "2026-07-01,West,ST-408,Denver Center,Denver,Standard Mall,Electronics,19000,3900,7500,195000,9000,186000,190000,380,3,4100,4.4,5000",
      "2026-07-01,West,ST-408,Denver Center,Denver,Standard Mall,Home & Kitchen,19000,3100,5800,110000,5000,105000,112000,450,4,2900,4.2,2000",
      "2026-07-01,Pacific,ST-502,Seattle Core,Seattle,Flagship,Electronics,29000,7400,16200,410000,18000,392000,360000,520,1,7500,4.7,8000",
      "2026-07-01,Pacific,ST-502,Seattle Core,Seattle,Flagship,Apparel,29000,9500,21000,315000,15000,300000,285000,1100,0,3200,4.5,5000"
    ];

    const csvContent = `${headers}\n${rows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "retail_weekly_sales_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Template for Store Master CSV
  const getStoreMasterTemplate = () => {
    const headers = "store_id,store_name,region,city,store_format";
    const rows = [
      "ST-101,New York Flagship,Northeast,New York,Flagship",
      "ST-102,Boston Hub,Northeast,Boston,High Street",
      "ST-204,Chicago Hub,Midwest,Chicago,Flagship",
      "ST-302,Dallas Galleria,South,Dallas,High Street",
      "ST-408,Denver Center,West,Denver,Standard Mall",
      "ST-502,Seattle Core,Pacific,Seattle,Flagship"
    ];

    const csvContent = `${headers}\n${rows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "store_master_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredStoreMaster = storeMasterRecords.filter(s => 
    s.storeId.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.storeName.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.region.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div id="data-uploader-section" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-6">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-100 mb-5 gap-6">
        <button
          id="tab-btn-sales"
          type="button"
          onClick={() => {
            setActiveTab("sales");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === "sales" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText size={14} />
          Weekly Sales Transactions
          {currentDatasetName !== "National Store Network (Standard Preset)" && (
            <span className="bg-indigo-100 text-indigo-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
              Live File
            </span>
          )}
          {activeTab === "sales" && (
            <motion.div layoutId="tab-active-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          id="tab-btn-master"
          type="button"
          onClick={() => {
            setActiveTab("store_master");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === "store_master" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Database size={14} />
          Store Master Database
          {storeMasterRecords.length > 0 ? (
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <CheckCircle size={8} />
              {storeMasterRecords.length} loaded
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
              Standard
            </span>
          )}
          {activeTab === "store_master" && (
            <motion.div layoutId="tab-active-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-between gap-6">
        
        {/* Drag and Drop Zone */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              {activeTab === "sales" ? (
                <>
                  <FileSpreadsheet size={16} className="text-indigo-600" />
                  <span>Retail Weekly Sales CSV Uploader</span>
                </>
              ) : (
                <>
                  <Database size={16} className="text-indigo-600" />
                  <span>Store Master Lookup CSV Uploader</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <Sparkles size={10} />
              <span>Active Parser</span>
            </div>
          </div>

          <form
            id="csv-drag-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-indigo-600 bg-indigo-50/40 animate-pulse"
                : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <UploadCloud size={32} className={`mb-2 transition-colors ${dragActive ? "text-indigo-600" : "text-slate-400"}`} />
            
            {activeTab === "sales" ? (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  Drag & drop <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">retail_weekly_sales</code> CSV or Excel here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or <span className="text-indigo-600 font-medium">browse local storage</span> to process weekly revenues and stockouts
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  Drag & drop <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">store_master</code> CSV or Excel here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or <span className="text-indigo-600 font-medium">browse local storage</span> to map IDs to specific regions, formats and cities
                </p>
              </>
            )}
          </form>
        </div>

        {/* Template info / Actions Column */}
        <div className="xl:w-[420px] border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
              <HelpCircle size={14} className="text-slate-400" />
              <span>
                {activeTab === "sales" ? "Sales Spreadsheet Protocol" : "Franchise Master Database columns"}
              </span>
            </div>
            
            {activeTab === "sales" ? (
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Resolves transactions, footfalls and returns. If a <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">store_id</code> is found, it will automatically join and inherit the region/city attributes specified in the Store Master database!
              </p>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Required schema headers: <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">store_id</code>, <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">store_name</code>, <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">region</code>, <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">city</code>, and <code className="font-mono text-[10px] bg-slate-50 px-1 py-0.5 rounded text-indigo-600">store_format</code>. Used as reference data.
              </p>
            )}

            {/* Error or Success banner feedback */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 text-rose-600 text-xs mb-4">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2 text-emerald-600 text-xs mb-4">
                <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "sales" ? (
              <button
                id="btn-download-sales-template"
                type="button"
                onClick={getDummyCSVTemplate}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100/70 cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                Get Sales Template
              </button>
            ) : (
              <button
                id="btn-download-master-template"
                type="button"
                onClick={getStoreMasterTemplate}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100/70 cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                Get Master Template
              </button>
            )}
            
            {activeTab === "sales" ? (
              currentDatasetName !== "National Store Network (Standard Preset)" && (
                <button
                  id="btn-reset-national"
                  type="button"
                  onClick={() => {
                    onResetDefault();
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100/80 cursor-pointer border border-rose-100 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Reset to default preset"
                >
                  <Trash2 size={14} />
                  Reset
                </button>
              )
            ) : (
              storeMasterRecords.length > 0 && (
                <button
                  id="btn-reset-master"
                  type="button"
                  onClick={() => {
                    onResetStoreMaster();
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100/80 cursor-pointer border border-rose-100 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Clear custom Store Master"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              )
            )}
          </div>
        </div>

      </div>

      {/* Interactive Preview table of store master database records */}
      {activeTab === "store_master" && storeMasterRecords.length > 0 && (
        <div id="store-master-preview" className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Database size={14} className="text-indigo-600" />
                Active Store Master Lookup Registry
              </h4>
              <p className="text-xs text-slate-400">Showing mapped values used for spreadsheet record resolution</p>
            </div>
            
            {/* Search filter input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered stores..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-3">Store ID</th>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStoreMaster.length > 0 ? (
                  filteredStoreMaster.map((store) => (
                    <tr key={store.storeId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-600">{store.storeId}</td>
                      <td className="p-3 font-semibold text-slate-700">{store.storeName}</td>
                      <td className="p-3">{store.region}</td>
                      <td className="p-3 text-slate-500">{store.city}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                          {store.storeFormat}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                      No registered stores match "{storeSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
