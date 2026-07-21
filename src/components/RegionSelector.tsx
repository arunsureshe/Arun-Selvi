import { MapPin, Globe } from "lucide-react";
import { motion } from "motion/react";

interface RegionSelectorProps {
  regions: string[];
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
  datasetName: string;
}

export default function RegionSelector({
  regions,
  selectedRegion,
  onSelectRegion,
  datasetName
}: RegionSelectorProps) {
  return (
    <div id="region-selector-container" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Globe size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dataset</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {datasetName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operating store networks across five major regional hubs
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-region-all"
            onClick={() => onSelectRegion(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
              selectedRegion === null
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <Globe size={14} />
            National Overview
          </button>

          {regions.map((region) => {
            const isSelected = selectedRegion === region;
            return (
              <button
                id={`btn-region-${region.toLowerCase()}`}
                key={region}
                onClick={() => onSelectRegion(region)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100/70"
                }`}
              >
                <MapPin size={14} />
                {region}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
