import zipfile,re,shutil,sys
src=sys.argv[1]; tmp=src+'.tmp'
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED) as zo:
  for it in zi.infolist():
    d=zi.read(it.filename)
    if re.match(r'ppt/slides/slide\d+\.xml$',it.filename):
      d=d.decode().replace('<a:pPr algn="r"','<a:pPr rtl="1" algn="r"').encode()
    zo.writestr(it,d)
shutil.move(tmp,src)
