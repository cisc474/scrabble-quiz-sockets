import sqlite3

f=file('ospd.txt', 'r')
lngstr = f.read()
f.close()

words = lngstr.split('\n')[:-1]
racks = {}
for wrd in words:
    key = ''.join(sorted(wrd)).upper()
    value = wrd.upper()
    if racks.has_key(key):
        racks[key].append(value)
    else:
        racks[key] = [value]

rcks = racks.keys()

values = {}

values['A']=1
values['E']=1
values['I']=1
values['O']=1
values['U']=1
values['R']=1
values['S']=1
values['T']=1
values['L']=1
values['N']=1
values['D']=2
values['G']=2
values['B']=3
values['C']=3
values['M']=3
values['P']=3
values['F']=4
values['H']=4
values['V']=4
values['W']=4
values['Y']=4
values['K']=5
values['J']=8
values['X']=8
values['Q']=10
values['Z']=10

info = [[y, sum(map(lambda x : values[x], sorted(y))), len(y), '@@'.join(racks[y])] for y in rcks]

template = "insert or replace into racks (rack, weight, length, words) values (?, ?, ?, ?)"

con = sqlite3.connect('scrabble.sqlite')

#I ran this command directly:
#create table racks (rack text, weight integer, length integer, words text);

cur = con.cursor()
for data in info:
    cur.execute(template, data)
    con.commit()