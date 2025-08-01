import gzip
import json
import os
import pandas as pd

# make the sample

SIZEIMP = 1000

all_data = pd.read_json(
  os.getcwd() + "/src/data/build/raw/dem_characteristics_importance.gz",
  orient='split')

all_waves = all_data['wave'].unique()
imp_responses = [r for r in all_data['imp_private_violence'].unique() if r != None]
pid3_responses = [r for r in all_data['pid3'].unique() if r != None and r != 'Not sure']

sample = dict()

for imp_var in all_data.columns[all_data.columns.str.startswith('imp_')]:
  sample[imp_var] = dict()
  for wave in all_waves:
    waveString = 'w' + str(wave).rjust(2, "0")
    nonempty = all_data[(all_data['wave'] == wave) & (all_data['pid3'].isin(pid3_responses)) & (all_data[imp_var].isin(imp_responses)) ]
    if (nonempty.shape[0] == 0):
      sample[imp_var][waveString] = None
    else:
      sample[imp_var][waveString] = [];
      for groups in [["Republican"], ["Democrat"], ["Independent","Other"]]:
        subset = nonempty[nonempty['pid3'].isin(groups)]
        sample[imp_var][waveString].extend([
          {
            'response': row._asdict()[imp_var], 
            'pid3': groups[0] if len(groups) == 1 else "Independent or Other"
          }
          for row in subset.sample(SIZEIMP, replace=True, weights=subset['weight']).itertuples(index=False)
        ])


'''
To assign coordinates for each view, we'll first need function
that compute group proportions for any given subset of the sample
'''
def proportions_unsplit(response, imp_var):
  total = 0
  count = 0
  for wave in iter(sample[imp_var]):
    if sample[imp_var][wave] is not None:
      total = total + SIZEIMP*3
      for point in sample[imp_var][wave]:
        if(point.response == response):
          count = count + 1;
  return count/total

def proportions_by_party(response, imp_var, party_string):
  total = 0
  count = 0
  for wave in iter(sample[imp_var]):
    if sample[imp_var][wave] is not None:
      total = total + SIZEIMP
      for point in sample[imp_var][wave]:
        if(point.response == response and point.pid3 == party_string):
          count = count + 1;
  return count/total

def proportions_by_wave(response, imp_var, wave):
  total = 0
  count = 0

#write the sample
with open(os.getcwd() + "/src/data/imp.json", 'w') as f:
  json.dump(sample, f)

