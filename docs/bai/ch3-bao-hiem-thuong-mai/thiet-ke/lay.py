import sys,re,subprocess,os,collections
slug=sys.argv[1]; out=sys.argv[2]
os.makedirs(out,exist_ok=True)
h=subprocess.run(['curl','-sS','--compressed','-L','-m','30','-A','Mozilla/5.0','https://slidesgo.com/theme/'+slug],capture_output=True).stdout.decode('utf8','ignore')
g=collections.defaultdict(dict)
for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/responsive-images/(\d+)-([a-z0-9-]+)___media_library_original_1600_900\.(?:jpg|png|webp)',h):
    g[m.group(2)][int(m.group(1))]=m.group(0)
if not g: print(slug,'NONE'); sys.exit()
name=slug if slug in g else max(g,key=lambda k:len(g[k]))
d=g[name]
print(slug,'->',name,len(d))
for i in sorted(d):
    subprocess.run(['curl','-sS','--compressed','-m','40','-o',f'{out}/{i:02d}.jpg',d[i]])
