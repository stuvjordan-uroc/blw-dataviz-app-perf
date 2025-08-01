import gzip
import json
import os
import pandas as pd


all_data = pd.read_json(
  os.getcwd() + "/src/data/build/raw/dem_characteristics_importance.gz",
  orient='split')

SIZEIMP = 1000

# make the samples
all_waves = all_data['wave'].unique()
imp_responses = [r for r in all_data['imp_private_violence'].unique() if r != None]
pid3_responses = [r for r in all_data['pid3'].unique() if r != None and r != 'Not sure']

print(pid3_responses)

sample = dict()


for imp_var in all_data.columns[all_data.columns.str.startswith('imp_')]:
  sample[imp_var] = dict()
  for wave in all_waves:
    waveString = 'w' + wave.rjust(2, "0")
    nonempty = all_data[(all_data['wave'] == wave) & (all_data['pid3'] != None) & (all_data[imp_var] != None) ]
    if (nonempty.shape[0] == 0):
      sample[imp_var][waveString] = None
    else:
      reps = nonempty[nonempty['pid3'] == "Republican"]
      dems = nonempty[nonempty['pid3'] == "Democrat"]
      ind_others = nonempty[(nonempty['pid3'] == "Independent") | (nonempty['pid3'] == "Other")]
      #first do the reps
      sample[imp_var][waveString] = [{'response': row[imp_var], 'pid3': 'Republican'} for row in reps.sample(SIZEIMP, replace=True, weights=reps['weight'])]
      #now push the dems
      sample[imp_var][waveString].extend([{'response': row[imp_var], 'pid3': 'Democrat'} for row in dems.sample(SIZEIMP, replace=True, weights=reps['weight'])])
      #now push the inds/others
      sample[imp_var][waveString].extend([{'response': row[imp_var], 'pid3': 'Independent or Other'} for row in ind_others.sample(SIZEIMP, replace=True, weights=reps['weight'])])




