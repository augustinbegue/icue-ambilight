![GitHub release (latest by date)](https://img.shields.io/github/v/release/augustinbegue/icue-ambilight?style=flat-square)
![GitHub release (latest by date)](https://img.shields.io/github/downloads/augustinbegue/icue-ambilight/latest/total?style=flat-square)
![GitHub all releases](https://img.shields.io/github/downloads/augustinbegue/icue-ambilight/total?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/augustinbegue/icue-ambilight/build-release?style=flat-square)
![GitHub](https://img.shields.io/github/license/augustinbegue/icue-ambilight?style=flat-square)

# icue-ambilight
<a href="https://www.corsair.com/icue"><img src="https://cwsmgmt.corsair.com/pdp/k65-rgb-mini/assets/images/icue-logo.png" alt="iCUE" height="80" /></a>

Synchronise your iCue compatible devices with the content displayed on your screen.

## Demonstration video (click)
[![Demonstration video](https://img.youtube.com/vi/KBrnEDs2tdk/0.jpg)](https://www.youtube.com/watch?v=KBrnEDs2tdk)

## Disclaimer
This software is a very early beta and I'm trying to find time to maintain and improve it. However since I'm currently a student this is pretty hard.
Feel free to make any requests to improve it and continuing posting issues as I will solve them in priority when i get the time to do it.

## Installation

Download the latest release [here](https://github.com/augustinbegue/icue-ambilight/releases).

## FAQ and Troubleshooting

<b>Before going further, check that you have installed [iCue](https://www.corsair.com/us/en/icue) and enabled the SDK in iCue's settings</b>

### How to enable the SDK :

Open iCue, then go into the settings tab.

<img src="https://i.imgur.com/fva2S4q.png">

Check the highlighted box and then, restart icue-ambilight for your changes to be taken into account

### For developpers :
![GitHub issues](https://img.shields.io/github/issues/augustinbegue/icue-ambilight?style=flat-square)
![GitHub closed issues](https://img.shields.io/github/issues-closed/augustinbegue/icue-ambilight?color=green&style=flat-square)
![GitHub commits since latest release (by date)](https://img.shields.io/github/commits-since/augustinbegue/icue-ambilight/latest?style=flat-square)

#### Build instructions :
- Make sure you have installed the prerequisites for the [cue-sdk](https://github.com/CorsairOfficial/cue-sdk-node) to work properly.
- Install the required packages with ``npm i --dev``
- Start the application with ``npm run start``
- Build the application with ``npm run dist``
