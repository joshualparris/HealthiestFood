"""Extract a small, provenance-preserving subset of official Australian AFCD Release 3.
Only stdlib zip/XML. This is generic-food *raw/preparation-state* composition,
not a complete meal or brand-specific retail panel. Do not fill unknown with zero.
Run: python scripts/afcd3_extract.py
"""
import io,json,re,urllib.request,zipfile,xml.etree.ElementTree as ET,pathlib,datetime
URL="https://www.foodstandards.gov.au/sites/default/files/2025-12/AFCD%20Release%203%20-%20Nutrient%20profiles.xlsx"
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
IDS=[
"F006143","F007598","F007648","F005184","F002880","F000448","F009176",
"F001905","F002378","F008749","F004781","F006538","F002276","F007535",
"F009035","F005946","F009775","F002247","F006225","F009800","F009193",
"F010071","F000162","F006116","F008210","F008209","F006177","F004193",
"F004213","F004726","F006277","F004816","F000262","F001289","F008951",
"F003729","F003721","F002806","F007827","F008720","F006579","F003320",
"F003539","F009190","F009222","F005174","F006081","F000095","F006543",
"F007973","F007853"
]
# Mandatory columns known from the workbook, per 100g as sold/analysed.
COLUMNS={"kj":"E","protein":"H","fat":"J","fibre":"L","calcium":"BD","iodine":"BJ","iron":"BK","magnesium":"BM","potassium":"BS","selenium":"BT","sodium":"BU","zinc":"BX","b12":"CP","vitaminD":"CZ","folate":"CS","vitaminC":"CU"}
def cells(row,strings):
 out={}
 for c in row.findall('m:c',NS):
  col=re.match(r'[A-Z]+',c.get('r') or '')
  if not col:continue
  v=c.find('m:v',NS); inline=c.find('m:is',NS)
  val=(v.text or '') if v is not None else ''.join(inline.itertext()) if inline is not None else ''
  if c.get('t')=='s' and val:val=strings[int(val)]
  out[col.group(0)]=val
 return out
def clean(v):
 try:
  x=float(v)
  return round(x,4)
 except (ValueError,TypeError):return None
def main():
 req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=45) as r:raw=r.read()
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  strings=[''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('.//m:si',NS)]
  root=ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
  allrows=root.findall('.//m:sheetData/m:row',NS)
  header=cells(allrows[2],strings)
  vitamins={}
  for key,regex in {"b12":r'vitamin\s*b12|cobalamin',"vitaminD":r'vitamin\s*d,\s*total|vitamin\s*d\s*\(',"folate":r'folate, total|folate,\s*dietary',"vitaminC":r'vitamin\s*c,\s*total|vitamin\s*c\s*\('}.items():
   cols=[k for k,v in header.items() if re.search(regex,v.lower())]
   print("VITAMIN-COLUMN",key,[(x,header[x]) for x in cols],flush=True)
   if len(cols)==1:vitamins[key]=cols[0]
  COLUMNS.update(vitamins)
  results={}
  for row in allrows[3:]:
   x=cells(row,strings)
   if x.get("A") not in IDS:continue
   results[x["A"]]={"id":x["A"],"name":x.get("D"),"derivation":x.get("C"),"per100":{k:clean(x.get(v)) for k,v in COLUMNS.items()}}
  absent=set(IDS)-set(results)
  if absent:raise ValueError("Unknown AFCD IDs "+",".join(sorted(absent)))
  output={"source":"FSANZ Australian Food Composition Database Release 3; nutrient profiles per 100g","sourceUrl":URL,"verifiedFoodIds":len(results),"units":{"kj":"kJ","protein":"g","fat":"g","fibre":"g","calcium":"mg","iodine":"micrograms","iron":"mg","magnesium":"mg","potassium":"mg","selenium":"micrograms","sodium":"mg","zinc":"mg","b12":"micrograms","vitaminD":"micrograms","folate":"micrograms","vitaminC":"mg"},"foods":results}
  dest=pathlib.Path("afcd3-foods.js")
  dest.write_text("/* Extracted official AFCD3 food rows; see scripts/afcd3_extract.py. Generic composition is NOT a brand label or nutrient guarantee. */\nwindow.AFCD3_FOODS = "+json.dumps(output,ensure_ascii=False,sort_keys=True,separators=(",",":"))+";\n",encoding="utf-8")
  print("EXPORTED",dest,len(results),"foods",dest.stat().st_size,"bytes")
  print("EXAMPLE",json.dumps({k:results[k] for k in ["F006143","F002880","F009176"]}))
if __name__=="__main__":main()
