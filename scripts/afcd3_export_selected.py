"""Export hand-selected, exactly named foods from FSANZ AFCD Release 3.
No pip packages. Workbook parsed via standard-library ZIP/XML in CI.
Print one auditable compact JSON line for retrieval; no fuzzy food matching.
"""
import io, json, re, urllib.request, zipfile, xml.etree.ElementTree as ET
URL="https://www.foodstandards.gov.au/sites/default/files/2025-12/AFCD%20Release%203%20-%20Nutrient%20profiles.xlsx"
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
# Exact food IDs recovered independently from the official Release 3 workbook.
FOODS={
 "F005184":"Lentil, red, hulled, dry",
 "F002276":"Carrot, mature, peeled, fresh, raw",
 "F002247":"Capsicum, red, fresh, raw",
 "F009775":"Zucchini, green skin, fresh, unpeeled, raw",
 "F006225":"Onion, mature, brown skinned, peeled, raw",
 "F004781":"Kale, raw",
 "F005946":"Mushroom, common, fresh, raw",
 "F004193":"Garlic, peeled, fresh, raw",
 "F004213":"Ginger, peeled, fresh, raw",
 "F004726":"Juice, lemon",
 "F006116":"Nut, walnut, raw, unsalted",
 "F008210":"Seed, linseed or flaxseed",
}
COLUMNS={"kj":"E","protein":"H","fibre":"L","sodium":"BU","calcium":"BD","iron":"BK","magnesium":"BM",
 "potassium":"BS","zinc":"BX","iodine":"BJ","folate":"CS","b12":"CP","vitaminD":"CZ"}
def col(s):
 return re.match(r"[A-Z]+",s).group(0)
def main():
 req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=45) as resp: data=resp.read()
 if len(data)<1000000:raise ValueError("AFCD file unexpectedly small")
 with zipfile.ZipFile(io.BytesIO(data)) as z:
  ss=[''.join(x.itertext()) for x in ET.fromstring(z.read("xl/sharedStrings.xml")).findall('.//m:si',NS)]
  tree=ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
  records={}
  for row in tree.findall('.//m:sheetData/m:row',NS):
   cells={}
   for c in row.findall('m:c',NS):
    v=c.find('m:v',NS);inline=c.find('m:is',NS)
    value=v.text if v is not None else ''.join(inline.itertext()) if inline is not None else ''
    if c.get('t')=="s" and value:value=ss[int(value)]
    cells[col(c.get('r'))]=value
   fid=cells.get('A')
   if fid not in FOODS:continue
   name=cells.get('D','')
   if name!=FOODS[fid]:raise ValueError(f"{fid}: got {name!r}, expected {FOODS[fid]!r}")
   nutrient={}
   for key,c in COLUMNS.items():
    raw=cells.get(c,'')
    try:
     value=float(raw) if raw not in ('',None) else None
     nutrient[key]=value if value is None or value>=0 else None
    except (ValueError,TypeError):nutrient[key]=None
   records[fid]={"name":name,"derivation":cells.get('C'),"per100":nutrient}
 if set(records)!=set(FOODS):raise ValueError("Missing official food IDs "+str(set(FOODS)-set(records)))
 payload={"release":"AFCD Release 3","source":URL,"referenceDate":"2026-10-17","weightState":"per 100 g raw/dry as listed, not cooked",
  "columns":COLUMNS,"foods":records}
 print("AFCD_SELECTED_JSON "+json.dumps(payload,sort_keys=True,separators=(',',':')),flush=True)
 print("VERIFIED_COUNT",len(records),flush=True)
if __name__=="__main__":main()
