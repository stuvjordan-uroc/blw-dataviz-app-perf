# Overview

Scripts in this folder take the raw data from the .gz files and build synthetic samples for use in the app. Generally, the synthetic samples will assign coordinates to each datapoint, so that no code needs to run on the client to calculate these coordinates.

Each section in this files focuses on one visualization tool in the app, describing the views the tool supplies, the coordinates needed for each point in each view, how those coordinates are calculated by the script, and how the runtime code can use those coordinates to build the views.

# Importance Tool

Views:

-
