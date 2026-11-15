import sys,os,glob
from PIL import Image
base='tai3/'
A=['table-infographics','pricing-table-infographics','simple-quadrants-infographics','strategic-planning-infographics','budget-infographics-blue','business-infographics-simple','strategy-infographics','project-management-infographics']
B=['legal-consulting-toolkit','corporate-strategy-consulting','digital-banking-consulting','economy-major-for-college-financial-management','business-annual-report','pastel-law-school-center-theme','ethics-and-the-criminal-defense-lawyer-thesis-defense','social-market-economy-proposal']
C=['isometric-seo-strategy','kindergarten-day-illustration','labor-law-workers-duties','detective-academy','research-project-academy']
n=34; rows=[]
for grp,sl in (('A',A),('B',B),('C',C)):
    for s in sl:
        fs=sorted(glob.glob(base+s+'/*.jpg'))
        if len(fs)<8: print('skip',s,len(fs)); continue
        k=min(16,len(fs)); idx=[round(i*(len(fs)-1)/(k-1)) for i in range(k)]
        sheet=Image.new('RGB',(560*4,315*4),'white')
        for j,i in enumerate(idx):
            im=Image.open(fs[i]).convert('RGB').resize((560,315),Image.LANCZOS)
            sheet.paste(im,((j%4)*560,(j//4)*315))
        name=f'ref-{n:02d}.jpg'; sheet.save(name,quality=85)
        rows.append((name,grp,s,len(fs),k)); print(name,grp,s,len(fs),k); n+=1
open('rows.txt','w').write('\n'.join('|'.join(map(str,r)) for r in rows))
