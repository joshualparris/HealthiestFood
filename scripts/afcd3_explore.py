"""Inspect FSANZ AFCD Release 3 nutrient workbook without third-party packages."""
import io,re,json,urllib.request,urllib.parse,zipfile,xml.etree.ElementTree as ET
URL="https://www.foodstandards.gov.au/sites/default/files/2025-12/AFCD%20Release%203%20-%20Nutrient%20profiles.xlsx"
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
def workbook_rows():
 req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=35) as r: raw=r.read()
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  strings=[''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('.//m:si',NS)]
  root=ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
  for row in root.findall('.//m:sheetData/m:row',NS):
   cells={}
   for cell in row.findall('m:c',NS):
    v=cell.find('m:v',NS); inline=cell.find('m:is',NS)
    val=(v.text or '') if v is not None else ''.join(inline.itertext()) if inline is not None else ''
    if cell.get('t')=='s' and val: val=strings[int(val)]
    col=re.match(r'^[A-Z]+',cell.attrib['r']).group(0)
    cells[col]=val
   yield cells
def main():
 rows=iter(workbook_rows())
 print('HEADING',json.dumps(next(rows)),flush=True)
 print('BLANK',json.dumps(next(rows)),flush=True)
 headings=next(rows)
 print('NUTRIENT_HEADERS',json.dumps(headings),flush=True)
 terms=['Oat,','Oats,','Seed, chia','Oil, olive','Tomato,','Chicken, thigh','Chicken, breast','Bean, black','Bean, kidney','Bean, red','Pea,','Bread, whole','Yoghurt, soy','Yoghurt,','Nut, almond','Soy bean,','Soy beverage','berry, purchased frozen','Water, tap','Mushroom, common','Lentil, red']
 found={x:[] for x in terms}
 total=0
 for row in rows:
  if not row.get('A','').startswith('F'):continue
  total+=1
  name=row.get('D','').lower()
  for term in terms:
   if term in name and len(found[term])<28: found[term].append((row['A'],row.get('D','')))
 print('TOTAL',total)
 for term,v in found.items():print('MATCH',term,json.dumps(v))
if __name__=='__main__':main()
