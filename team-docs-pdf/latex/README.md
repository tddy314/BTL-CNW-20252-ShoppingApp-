# Tai lieu LaTeX

Thu muc nay chua ma nguon LaTeX tieng Viet cho bo tai lieu he thong. Moi file
`.tex` (tru `common.tex`) tao mot PDF cung ten trong thu muc cha.

## Compile tai may

Su dung XeLaTeX de ho tro font Unicode va tieng Viet:

```powershell
cd team-docs-pdf\latex
xelatex -output-directory=.. 00-system-overview.tex
xelatex -output-directory=.. 00-system-overview.tex
xelatex -output-directory=.. 08-notification-service.tex
```

File tong quan can chay hai lan de cap nhat muc luc. Cac file con lai chi can
chay mot lan.

## Su dung tren Overleaf

Tai cac file `.tex` va `common.tex` len mot project Overleaf, chon compiler
`XeLaTeX`, sau do chon file tai lieu can bien dich lam main document.
