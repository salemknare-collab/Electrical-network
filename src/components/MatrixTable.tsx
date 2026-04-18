import React, { useMemo } from 'react';
import { Incident } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, LabelList, Cell } from 'recharts';

interface MatrixTableProps {
  incidents: Incident[];
}

export default function MatrixTable({ incidents }: MatrixTableProps) {
  // Extract unique regions, reasons, and voltages
  const regions = useMemo(() => Array.from(new Set(incidents.map(i => i.region))).sort(), [incidents]);
  const reasons = useMemo(() => Array.from(new Set(incidents.map(i => i.reason))).sort(), [incidents]);
  
  // Create a hierarchical structure of reasons and their specific voltages used in these incidents
  const reasonVoltages = useMemo(() => {
    const rv: Record<string, string[]> = {};
    reasons.forEach(reason => {
      const voltagesForReason = new Set(
        incidents.filter(i => i.reason === reason).map(i => i.voltage)
      );
      // Sort voltages generally numeric descending/ascending
      rv[reason] = Array.from(voltagesForReason).sort((a, b) => {
         const numA = parseFloat(a) || 0;
         const numB = parseFloat(b) || 0;
         return numB - numA;
      });
    });
    return rv;
  }, [incidents, reasons]);

  // Aggregate data
  const matrixData = useMemo(() => {
    const acc: Record<string, Record<string, Record<string, number>>> = {};
    incidents.forEach(inc => {
      if (!acc[inc.region]) acc[inc.region] = {};
      if (!acc[inc.region][inc.reason]) acc[inc.region][inc.reason] = {};
      if (!acc[inc.region][inc.reason][inc.voltage]) acc[inc.region][inc.reason][inc.voltage] = 0;
      
      acc[inc.region][inc.reason][inc.voltage] += 1;
    });
    return acc;
  }, [incidents]);

  // Helper to get safe value
  const getValue = (region: string, reason: string, voltage: string) => {
    return matrixData[region]?.[reason]?.[voltage] || 0;
  };

  // Calculate Region Totals (Row Totals)
  const getRegionTotal = (region: string) => {
    let total = 0;
    reasons.forEach(reason => {
      reasonVoltages[reason].forEach(voltage => {
        total += getValue(region, reason, voltage);
      });
    });
    return total;
  };

  // Calculate Column Totals (Bottom Totals)
  const getColumnTotal = (reason: string, voltage: string) => {
    let total = 0;
    regions.forEach(region => {
      total += getValue(region, reason, voltage);
    });
    return total;
  };

  const grandTotal = incidents.length;

  if (incidents.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-medium">لا توجد أحداث מסجلة في هذه الفترة لإظهار التقرير</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full p-2 bg-white rounded-xl">
      <div className="w-full overflow-x-auto print:overflow-visible">
        <table className="w-full text-sm text-center border-collapse border border-slate-300">
          <thead className="bg-[#f8fafc]">
          {/* First Header Row: Reasons */}
          <tr>
            <th className="border border-slate-300 p-2 font-bold text-slate-800 bg-slate-100 min-w-[120px]" rowSpan={2}>
              الإدارة
            </th>
            {reasons.map(reason => (
              <th 
                key={reason} 
                className="border border-slate-300 p-2 font-bold text-slate-800 bg-blue-50"
                colSpan={reasonVoltages[reason].length}
              >
                {reason}
              </th>
            ))}
            <th className="border border-slate-300 p-2 font-bold text-slate-800 bg-slate-100 min-w-[80px]" rowSpan={2}>
              إجمالي
            </th>
          </tr>
          {/* Second Header Row: Voltages */}
          <tr>
            {reasons.map(reason => (
              reasonVoltages[reason].map(voltage => (
                <th key={`${reason}-${voltage}`} className="border border-slate-300 p-2 text-xs font-bold text-slate-600 bg-slate-50 min-w-[60px] whitespace-nowrap">
                  <span dir="ltr" className="inline-block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '80px', padding: '10px 0' }}>
                    {voltage}KV
                  </span>
                </th>
              ))
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map(region => {
            const rowTotal = getRegionTotal(region);
            if (rowTotal === 0) return null; // Hide empty regions if any magically appear
            return (
              <tr key={region} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-300 p-2 font-bold text-slate-800 text-right pr-4 bg-slate-50">{region}</td>
                {reasons.map(reason => (
                  reasonVoltages[reason].map(voltage => {
                    const val = getValue(region, reason, voltage);
                    return (
                      <td key={`${region}-${reason}-${voltage}`} className="border border-slate-300 p-2 text-slate-700">
                        {val > 0 ? val : ''}
                      </td>
                    );
                  })
                ))}
                <td className="border border-slate-300 p-2 font-bold text-blue-700 bg-blue-50">
                  {rowTotal}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-100 font-bold text-slate-800">
          <tr>
            <td className="border border-slate-300 p-3 text-right pr-4">أجمالي</td>
            {reasons.map(reason => (
              reasonVoltages[reason].map(voltage => (
                <td key={`total-${reason}-${voltage}`} className="border border-slate-300 p-3 text-slate-800">
                  {getColumnTotal(reason, voltage) > 0 ? getColumnTotal(reason, voltage) : ''}
                </td>
              ))
            ))}
            <td className="border border-slate-300 p-3 text-red-600 text-lg">
              {grandTotal}
            </td>
          </tr>
        </tfoot>
      </table>
      </div>

      <div className="w-full flex flex-col gap-6 print:mt-10 mt-6">
        <h4 className="font-bold text-center text-slate-800 text-lg">
          رسم بياني يبين إجمالي النسبة المئوية للفصولات (بالوقاية)
        </h4>

        {/* جدول النسب المئوية */}
        <div className="w-full overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm text-center border-collapse border border-slate-300 min-w-[600px]">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="border border-slate-300 p-2 font-bold text-slate-800 bg-slate-100 min-w-[120px]">
                  التفصيلات
                </th>
                {reasons.map(reason => (
                  <th key={reason} className="border border-slate-300 p-2 font-bold text-slate-800 bg-slate-100 min-w-[120px]">
                    {reason}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Build rows dynamically: Row 1 Voltage, Row 2 Percent */}
              {/* To make it look like the picture, we need a list of unique voltages across all reasons, or we can just iterate through what we have. Let's create a combined list array for columns. */}
              {(() => {
                 // Flatten reasons and voltages into array of columns
                 const cols: {reason: string, voltage: string, count: number, percent: string}[] = [];
                 reasons.forEach(reason => {
                   reasonVoltages[reason].forEach(voltage => {
                     const count = getColumnTotal(reason, voltage);
                     const percent = grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(2) : '0.00';
                     cols.push({ reason, voltage, count, percent });
                   });
                 });

                 if(cols.length === 0) return null;

                 return (
                   <>
                     <tr className="hover:bg-slate-50 transition-colors">
                       <td className="border border-slate-300 p-3 font-bold bg-slate-50 text-slate-800">
                         الجهد ك.ف
                       </td>
                       {reasons.map(reason => (
                         <td key={`${reason}-volts`} className="border border-slate-300 p-0 align-top">
                           <div className="flex justify-between divide-x divide-x-reverse h-full border-b border-white">
                              {reasonVoltages[reason].map(v => (
                                <div key={v} className="flex-1 p-2 font-medium" dir="ltr">{v}</div>
                              ))}
                           </div>
                         </td>
                       ))}
                     </tr>
                     <tr className="hover:bg-slate-50 transition-colors">
                       <td className="border border-slate-300 p-3 font-bold bg-slate-50 text-slate-800">
                         نسبة المئوية (%)
                       </td>
                       {reasons.map(reason => (
                         <td key={`${reason}-percents`} className="border border-slate-300 p-0 align-top">
                           <div className="flex justify-between divide-x divide-x-reverse h-full">
                              {reasonVoltages[reason].map(v => {
                                const count = getColumnTotal(reason, v);
                                const percent = grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(2) : '0.00';
                                return (
                                  <div key={v} className="flex-1 p-2 text-slate-600 font-bold" dir="ltr">{percent}%</div>
                                )
                              })}
                           </div>
                         </td>
                       ))}
                     </tr>
                   </>
                 )
              })()}
            </tbody>
          </table>
        </div>

        {/* المخطط الإحصائي للنسب المئوية */}
        <div className="w-full flex items-center justify-center h-[350px] mt-6">
           {(() => {
              const dataForChart: {name: string, percent: number}[] = [];
              reasons.forEach(reason => {
                reasonVoltages[reason].forEach(voltage => {
                  const count = getColumnTotal(reason, voltage);
                  const percent = grandTotal > 0 ? ((count / grandTotal) * 100) : 0;
                  if(percent > 0) {
                     dataForChart.push({
                        name: `${reason} - ${voltage}KV`,
                        percent: Number(percent.toFixed(2))
                     });
                  }
                });
              });

              // Colors based on picture (mostly gray outlines, we can do a nice bar chart)
              return (
                 <ResponsiveContainer width="100%" height={350}>
                   <BarChart data={dataForChart} margin={{ top: 30, right: 0, left: -20, bottom: 40 }} barSize={30}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis 
                       dataKey="name" 
                       angle={-45} 
                       textAnchor="end" 
                       tick={{ fill: '#475569', fontSize: 11 }} 
                       interval={0} 
                       axisLine={true} 
                       tickLine={true} 
                     />
                     <YAxis 
                       tick={{ fill: '#475569', fontSize: 12 }} 
                       axisLine={false} 
                       tickLine={false} 
                       tickFormatter={(v) => `${v}%`}
                     />
                     <RechartsTooltip 
                       formatter={(value: number) => [`${value}%`, 'النسبة المئوية']}
                       labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                     />
                     <Bar dataKey="percent" fill="#94a3b8" radius={[4, 4, 0, 0]}>
                       <LabelList dataKey="percent" position="top" formatter={(val: number) => `${val}%`} style={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                       {dataForChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              );
           })()}
        </div>
      </div>
    </div>
  );
}
