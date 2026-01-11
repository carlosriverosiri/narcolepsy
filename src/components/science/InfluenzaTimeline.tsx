import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Syringe } from 'lucide-react';

interface SeasonData {
  season: string;
  dominantStrains: string;
  vaccineComposition: string;
  h1n1: boolean;
  h3n2: boolean;
  pandemic?: boolean;
  note?: string;
}

const INFLUENZA_DATA: SeasonData[] = [
  { season: '1976–1977', dominantStrains: 'A/Victoria/3/75 (H3N2); A/New Jersey/76 (H1N1, swine flu outbreak)', vaccineComposition: 'A/Victoria/3/75 (H3N2); A/New Jersey/8/76 (H1N1); B/Hong Kong/5/72', h1n1: true, h3n2: true, note: 'Swine flu outbreak' },
  { season: '1977–1978', dominantStrains: 'A/USSR/90/77 (H1N1, Russian flu re-emergence); A/Texas/1/77 (H3N2)', vaccineComposition: 'A/USSR/90/77 (H1N1); A/Texas/1/77 (H3N2); B/Hong Kong/5/72', h1n1: true, h3n2: true, pandemic: true, note: 'Russian flu re-emergence' },
  { season: '1978–1979', dominantStrains: 'A/USSR/90/77 (H1N1); A/Brazil/11/78 (H3N2)', vaccineComposition: 'A/USSR/90/77 (H1N1); A/Brazil/11/78 (H3N2); B/Singapore/222/79', h1n1: true, h3n2: true },
  { season: '1979–1980', dominantStrains: 'A/Brazil/11/78 (H3N2); B/Singapore/222/79', vaccineComposition: 'A/USSR/90/77 (H1N1); A/Brazil/11/78 (H3N2); B/Singapore/222/79', h1n1: false, h3n2: true },
  { season: '1980–1981', dominantStrains: 'A/Bangkok/1/79 (H3N2); B/Singapore/222/79', vaccineComposition: 'A/Brazil/11/78 (H3N2); A/USSR/90/77 (H1N1); B/Singapore/222/79', h1n1: false, h3n2: true },
  { season: '1981–1982', dominantStrains: 'A/Bangkok/1/79 (H3N2); B/Singapore/222/79', vaccineComposition: 'A/Brazil/11/78 (H3N2); A/USSR/90/77 (H1N1); B/Singapore/222/79', h1n1: false, h3n2: true },
  { season: '1982–1983', dominantStrains: 'A/Philippines/2/82 (H3N2); B/Singapore/222/79', vaccineComposition: 'A/Bangkok/1/79 (H3N2); A/Brazil/11/78 (H1N1); B/Singapore/222/79', h1n1: false, h3n2: true },
  { season: '1983–1984', dominantStrains: 'A/Philippines/2/82 (H3N2); B/USSR/100/83', vaccineComposition: 'A/Philippines/2/82 (H3N2); A/Brazil/11/78 (H1N1); B/Singapore/222/79', h1n1: false, h3n2: true },
  { season: '1984–1985', dominantStrains: 'A/Philippines/2/82 (H3N2); B/USSR/100/83', vaccineComposition: 'A/Philippines/2/82 (H3N2); A/Chile/1/83 (H1N1); B/USSR/100/83', h1n1: false, h3n2: true },
  { season: '1985–1986', dominantStrains: 'A/Singapore/6/86 (H1N1); A/Philippines/2/82 (H3N2)', vaccineComposition: 'A/Philippines/2/82 (H3N2); A/Chile/1/83 (H1N1); B/USSR/100/83', h1n1: true, h3n2: true },
  { season: '1986–1987', dominantStrains: 'A/Singapore/6/86 (H1N1); A/Philippines/2/82 (H3N2)', vaccineComposition: 'A/Singapore/6/86 (H1N1); A/Chile/1/83 (H3N2); B/Ann Arbor/1/86', h1n1: true, h3n2: true },
  { season: '1987–1988', dominantStrains: 'A/Leningrad/360/86 (H3N2); A/Singapore/6/86 (H1N1)', vaccineComposition: 'A/Leningrad/360/86 (H3N2); A/Singapore/6/86 (H1N1); B/Ann Arbor/1/86', h1n1: true, h3n2: true },
  { season: '1988–1989', dominantStrains: 'A/Sichuan/2/87 (H3N2); A/Taiwan/1/86 (H1N1)', vaccineComposition: 'A/Sichuan/2/87 (H3N2); A/Taiwan/1/86 (H1N1); B/Victoria/2/87', h1n1: true, h3n2: true },
  { season: '1989–1990', dominantStrains: 'A/Shanghai/11/87 (H3N2); A/Taiwan/1/86 (H1N1)', vaccineComposition: 'A/Shanghai/11/87 (H3N2); A/Taiwan/1/86 (H1N1); B/Yamagata/16/88', h1n1: true, h3n2: true },
  { season: '1990–1991', dominantStrains: 'A/Shanghai/16/89 (H3N2); A/Taiwan/1/86 (H1N1)', vaccineComposition: 'A/Shanghai/16/89 (H3N2); A/Taiwan/1/86 (H1N1); B/Yamagata/16/88', h1n1: true, h3n2: true },
  { season: '1991–1992', dominantStrains: 'A/Beijing/353/89 (H3N2); A/Singapore/6/86 (H1N1)', vaccineComposition: 'A/Beijing/353/89 (H3N2); A/Taiwan/1/86 (H1N1); B/Panama/45/90', h1n1: true, h3n2: true },
  { season: '1992–1993', dominantStrains: 'A/Beijing/353/89 (H3N2); A/Singapore/6/86 (H1N1)', vaccineComposition: 'A/Beijing/353/89 (H3N2); A/Taiwan/1/86 (H1N1); B/Panama/45/90', h1n1: true, h3n2: true },
  { season: '1993–1994', dominantStrains: 'A/Beijing/32/92 (H3N2); A/Singapore/6/86 (H1N1)', vaccineComposition: 'A/Beijing/32/92 (H3N2); A/Taiwan/1/86 (H1N1); B/Panama/45/90', h1n1: true, h3n2: true },
  { season: '1994–1995', dominantStrains: 'A/Shangdong/9/93 (H3N2); A/Texas/36/91 (H1N1)', vaccineComposition: 'A/Shangdong/9/93 (H3N2); A/Texas/36/91 (H1N1); B/Panama/45/90', h1n1: true, h3n2: true },
  { season: '1995–1996', dominantStrains: 'A/Johannesburg/33/94 (H3N2); A/Texas/36/91 (H1N1)', vaccineComposition: 'A/Johannesburg/33/94 (H3N2); A/Texas/36/91 (H1N1); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '1996–1997', dominantStrains: 'A/Wuhan/359/95 (H3N2); A/Texas/36/91 (H1N1)', vaccineComposition: 'A/Wuhan/359/95 (H3N2); A/Texas/36/91 (H1N1); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '1997–1998', dominantStrains: 'A/Wuhan/359/95 (H3N2); A/Bayern/7/95 (H1N1)', vaccineComposition: 'A/Wuhan/359/95 (H3N2); A/Bayern/7/95 (H1N1); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '1998–1999', dominantStrains: 'A/Sydney/5/97 (H3N2); A/Beijing/262/95 (H1N1)', vaccineComposition: 'A/Sydney/5/97 (H3N2); A/Beijing/262/95 (H1N1); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '1999–2000', dominantStrains: 'A/Sydney/5/97 (H3N2); A/Beijing/262/95 (H1N1)', vaccineComposition: 'A/Sydney/5/97 (H3N2); A/Beijing/262/95 (H1N1); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '2000–2001', dominantStrains: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2); B/Beijing/184/93', h1n1: true, h3n2: true },
  { season: '2001–2002', dominantStrains: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2); B/Sichuan/379/99', h1n1: true, h3n2: true },
  { season: '2002–2003', dominantStrains: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2); B/Hong Kong/330/2001', h1n1: true, h3n2: true },
  { season: '2003–2004', dominantStrains: 'A/Fujian/411/2002 (H3N2); A/New Caledonia/20/99 (H1N1)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Moscow/10/99 (H3N2); B/Hong Kong/330/2001', h1n1: true, h3n2: true, note: 'Vaccine mismatch (Fujian)' },
  { season: '2004–2005', dominantStrains: 'A/Fujian/411/2002 (H3N2); A/New Caledonia/20/99 (H1N1)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Fujian/411/2002 (H3N2); B/Shanghai/361/2002', h1n1: true, h3n2: true },
  { season: '2005–2006', dominantStrains: 'A/California/7/2004 (H3N2); A/New Caledonia/20/99 (H1N1)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/California/7/2004 (H3N2); B/Shanghai/361/2002', h1n1: true, h3n2: true },
  { season: '2006–2007', dominantStrains: 'A/Wisconsin/67/2005 (H3N2); A/New Caledonia/20/99 (H1N1)', vaccineComposition: 'A/New Caledonia/20/99 (H1N1); A/Wisconsin/67/2005 (H3N2); B/Malaysia/2506/2004', h1n1: true, h3n2: true },
  { season: '2007–2008', dominantStrains: 'A/Solomon Islands/3/2006 (H1N1); A/Wisconsin/67/2005 (H3N2)', vaccineComposition: 'A/Solomon Islands/3/2006 (H1N1); A/Wisconsin/67/2005 (H3N2); B/Malaysia/2506/2004', h1n1: true, h3n2: true },
  { season: '2008–2009', dominantStrains: 'A/Brisbane/59/2007 (H3N2); A/Brisbane/10/2007 (H1N1)', vaccineComposition: 'A/Brisbane/59/2007 (H3N2); A/Brisbane/10/2007 (H1N1); B/Florida/4/2006', h1n1: true, h3n2: true },
  { season: '2009–2010', dominantStrains: 'A/California/7/2009 (H1N1pdm09, pandemic); A/Brisbane/59/2007 (H3N2)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Brisbane/59/2007 (H3N2); B/Brisbane/60/2008', h1n1: true, h3n2: true, pandemic: true, note: '🔴 SWINE FLU PANDEMIC — Pandemrix → Narcolepsy' },
  { season: '2010–2011', dominantStrains: 'A/California/7/2009 (H1N1pdm09); A/Perth/16/2009 (H3N2)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Perth/16/2009 (H3N2); B/Brisbane/60/2008', h1n1: true, h3n2: true },
  { season: '2011–2012', dominantStrains: 'A/California/7/2009 (H1N1pdm09); A/Perth/16/2009 (H3N2)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Perth/16/2009 (H3N2); B/Brisbane/60/2008', h1n1: true, h3n2: true },
  { season: '2012–2013', dominantStrains: 'A/Victoria/361/2011 (H3N2); A/California/7/2009 (H1N1pdm09)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Victoria/361/2011 (H3N2); B/Wisconsin/1/2010', h1n1: true, h3n2: true },
  { season: '2013–2014', dominantStrains: 'A/California/7/2009 (H1N1pdm09); A/Texas/50/2012 (H3N2)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Texas/50/2012 (H3N2); B/Massachusetts/2/2012', h1n1: true, h3n2: true },
  { season: '2014–2015', dominantStrains: 'A/Texas/50/2012 (H3N2); A/California/7/2009 (H1N1pdm09)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Texas/50/2012 (H3N2); B/Massachusetts/2/2012', h1n1: true, h3n2: true },
  { season: '2015–2016', dominantStrains: 'A/Switzerland/9715293/2013 (H3N2); A/California/7/2009 (H1N1pdm09)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Switzerland/9715293/2013 (H3N2); B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2016–2017', dominantStrains: 'A/Hong Kong/4801/2014 (H3N2); A/California/7/2009 (H1N1pdm09)', vaccineComposition: 'A/California/7/2009 (H1N1pdm09); A/Hong Kong/4801/2014 (H3N2); B/Brisbane/60/2008', h1n1: true, h3n2: true, note: '🟡 H3N2 dominant — Havana Syndrome period?' },
  { season: '2017–2018', dominantStrains: 'A/Hong Kong/4801/2014 (H3N2); A/Michigan/45/2015 (H1N1pdm09)', vaccineComposition: 'A/Michigan/45/2015 (H1N1pdm09); A/Hong Kong/4801/2014 (H3N2); B/Brisbane/60/2008', h1n1: true, h3n2: true },
  { season: '2018–2019', dominantStrains: 'A/Singapore/INFIMH-16-0019/2016 (H3N2); A/Michigan/45/2015 (H1N1pdm09)', vaccineComposition: 'A/Michigan/45/2015 (H1N1pdm09); A/Singapore/INFIMH-16-0019/2016 (H3N2); B/Colorado/06/2017; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2019–2020', dominantStrains: 'A/Kansas/14/2017 (H3N2); A/Brisbane/02/2018 (H1N1pdm09)', vaccineComposition: 'A/Brisbane/02/2018 (H1N1pdm09); A/Kansas/14/2017 (H3N2); B/Colorado/06/2017; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2020–2021', dominantStrains: 'A/Guangdong-Maonan/SWL1536/2019 (H1N1pdm09); A/Hong Kong/2671/2019 (H3N2)', vaccineComposition: 'A/Guangdong-Maonan/SWL1536/2019 (H1N1pdm09); A/Hong Kong/2671/2019 (H3N2); B/Washington/02/2019; B/Phuket/3073/2013', h1n1: true, h3n2: true, note: 'COVID-19 pandemic year' },
  { season: '2021–2022', dominantStrains: 'A/Victoria/2570/2019 (H1N1pdm09); A/Cambodia/e0826360/2020 (H3N2)', vaccineComposition: 'A/Victoria/2570/2019 (H1N1pdm09); A/Cambodia/e0826360/2020 (H3N2); B/Washington/02/2019; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2022–2023', dominantStrains: 'A/Darwin/9/2021 (H3N2); A/Victoria/4897/2022 (H1N1pdm09)', vaccineComposition: 'A/Victoria/4897/2022 (H1N1pdm09); A/Darwin/9/2021 (H3N2); B/Austria/1359417/2021; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2023–2024', dominantStrains: 'A/Darwin/9/2021 (H3N2); A/Victoria/4897/2022 (H1N1pdm09)', vaccineComposition: 'A/Victoria/4897/2022 (H1N1pdm09); A/Darwin/9/2021 (H3N2); B/Austria/1359417/2021; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2024–2025', dominantStrains: 'A/Thailand/8/2022 (H3N2); A/Wisconsin/67/2022 (H1N1pdm09)', vaccineComposition: 'A/Wisconsin/67/2022 (H1N1pdm09); A/Thailand/8/2022 (H3N2); B/Austria/1359417/2021; B/Phuket/3073/2013', h1n1: true, h3n2: true },
  { season: '2025–2026', dominantStrains: 'A/Thailand/8/2022 (H3N2); A/Wisconsin/13/2023 (H1N1pdm09)', vaccineComposition: 'A/Wisconsin/13/2023 (H1N1pdm09); A/Thailand/8/2022 (H3N2); B/Austria/1359417/2021; B/Phuket/3073/2013', h1n1: true, h3n2: true },
];

type FilterType = 'all' | 'h1n1' | 'h3n2' | 'pandemic';
type DecadeType = 'all' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export default function InfluenzaTimeline() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [decade, setDecade] = useState<DecadeType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = INFLUENZA_DATA.filter(item => {
    // Decade filter
    if (decade !== 'all') {
      const year = parseInt(item.season.split('–')[0]);
      if (decade === '1970s' && (year < 1976 || year >= 1980)) return false;
      if (decade === '1980s' && (year < 1980 || year >= 1990)) return false;
      if (decade === '1990s' && (year < 1990 || year >= 2000)) return false;
      if (decade === '2000s' && (year < 2000 || year >= 2010)) return false;
      if (decade === '2010s' && (year < 2010 || year >= 2020)) return false;
      if (decade === '2020s' && year < 2020) return false;
    }
    
    // Type filter
    if (filter === 'h1n1' && !item.h1n1) return false;
    if (filter === 'h3n2' && !item.h3n2) return false;
    if (filter === 'pandemic' && !item.pandemic) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return item.season.toLowerCase().includes(search) ||
             item.dominantStrains.toLowerCase().includes(search) ||
             item.vaccineComposition.toLowerCase().includes(search) ||
             (item.note?.toLowerCase().includes(search) ?? false);
    }
    
    return true;
  });

  return (
    <div className="w-full bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white">
          <h2 className="text-2xl font-bold tracking-tight">Influenza Strains & Vaccine History</h2>
          <p className="text-slate-400 text-sm mt-1">50 years of circulating strains and vaccine compositions (1976–2026)</p>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search strains, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Decade filter */}
          <select
            value={decade}
            onChange={(e) => setDecade(e.target.value as DecadeType)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
          >
            <option value="all">All Decades</option>
            <option value="1970s">1970s</option>
            <option value="1980s">1980s</option>
            <option value="1990s">1990s</option>
            <option value="2000s">2000s</option>
            <option value="2010s">2010s</option>
            <option value="2020s">2020s</option>
          </select>

          {/* Type filter */}
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-300">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('h1n1')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filter === 'h1n1' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50'}`}
            >
              H1N1
            </button>
            <button
              onClick={() => setFilter('h3n2')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filter === 'h3n2' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`}
            >
              H3N2
            </button>
            <button
              onClick={() => setFilter('pandemic')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${filter === 'pandemic' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-amber-50'}`}
            >
              <AlertTriangle className="w-3 h-3" /> Pandemics
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>H1N1 dominant</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span>H3N2 dominant</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>Pandemic year</span>
          </div>
          <div className="flex items-center gap-1">
            <Syringe className="w-3 h-3 text-emerald-600" />
            <span>Vaccine composition</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-800 text-white">
              <tr>
                <th className="text-left py-3 px-4 font-bold">Season</th>
                <th className="text-left py-3 px-4 font-bold">Dominant Circulating Strains</th>
                <th className="text-left py-3 px-4 font-bold">Vaccine Composition (Northern Hemisphere)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr 
                  key={item.season}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${item.pandemic ? 'bg-amber-50' : ''}`}
                >
                  <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.pandemic && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {item.season}
                    </div>
                    {item.note && (
                      <div className={`text-xs mt-1 ${item.pandemic ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                        {item.note}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {item.dominantStrains.split('; ').map((strain, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {strain.includes('H1N1') && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                          {strain.includes('H3N2') && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                          {!strain.includes('H1N1') && !strain.includes('H3N2') && <span className="w-2 h-2 rounded-full bg-slate-400"></span>}
                          <span className={strain.includes('pdm09') ? 'font-bold text-red-700' : ''}>{strain}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-start gap-2">
                      <Syringe className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{item.vaccineComposition}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs text-slate-600">
          <p className="mb-2">
            <strong>Sources:</strong> WHO Global Influenza Programme; CDC Past Seasons Summary; 
            Harper et al. (2005) MMWR Recommendations.
          </p>
          <p>
            <strong>Note:</strong> Vaccine effectiveness varies (30–60% against hospitalization). 
            Quadrivalent vaccines (from 2012–2013) reduce B-lineage mismatch risk.
          </p>
        </div>
      </div>
    </div>
  );
}
