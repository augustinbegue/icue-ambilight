![GitHub release (latest by date)](https://img.shields.io/github/v/release/augustinbegue/icue-ambilight?style=flat-square)
![GitHub release (latest by date)](https://img.shields.io/github/downloads/augustinbegue/icue-ambilight/latest/total?style=flat-square)
![GitHub all releases](https://img.shields.io/github/downloads/augustinbegue/icue-ambilight/total?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/augustinbegue/icue-ambilight/build-release?style=flat-square)
![GitHub](https://img.shields.io/github/license/augustinbegue/icue-ambilight?style=flat-square)

# icue-ambilight

<a href="https://www.corsair.com/icue"><img src="https://cwsmgmt.corsair.com/pdp/k65-rgb-mini/assets/images/icue-logo.png" alt="iCUE" height="80" /></a>

Ambilight for Corsair devices: Synchronise the colors of your iCue compatible devices with the content displayed on your screen.

## ✨ Demonstration video

[![Demonstration video](https://img.youtube.com/vi/KBrnEDs2tdk/0.jpg)](https://www.youtube.com/watch?v=KBrnEDs2tdk)

_click on the image (this video is quite old and I have to remake one)_

## 🚨 Disclaimer

This software is a very early beta and I'm trying to find time to maintain and improve it. However since I'm currently a student this is pretty hard.
Feel free to make any requests to improve it and continuing posting issues as I will solve them in priority when i get the time to do it.

## 📦 Installation

Download the latest release [here](https://github.com/augustinbegue/icue-ambilight/releases).

## 🤔 FAQ and Troubleshooting

<b>⚠️🚨 Before going further, please check that you have installed [iCue](https://www.corsair.com/us/en/icue) and [enabled the SDK](#how-to-enable-the-sdk-) in iCue's settings 🚨⚠️</b>

### How to enable the SDK :

-   Open iCue, then click on the settings icon:

      <img src="https://i.imgur.com/xMyHjjW.png">

-   Then click on the "Software and Games" tab and enable this option:

      <img src="https://i.imgur.com/5LqQxJB.png">

-   Finally, after restarting icue-ambilight, you should see this line appear:

      <img src="https://i.imgur.com/5LqQxJB.png">

### My Device/Peripheral is not working :

-   Go in the **settings** tab, and check if it is detected by icue-ambilight.

-   If it is, check if it is enabled in the **layout** tab.

-   If it **isn't in the list**, check if it is detected by iCue. If it is, [open an issue](https://github.com/augustinbegue/icue-ambilight/issues/new/choose). If it isn't, the problem is related to iCue/your peripheral.

### My Issue/Question isn't listed here :

-   Ask a question in [Discussions](https://github.com/augustinbegue/icue-ambilight/discussions).

-   [Open an issue](https://github.com/augustinbegue/icue-ambilight/issues/new/choose).

-   Send me an [Email](mailto://augustin.begue@epita.fr).

## ⚒️ For developpers :

![GitHub issues](https://img.shields.io/github/issues/augustinbegue/icue-ambilight?style=flat-square)
![GitHub closed issues](https://img.shields.io/github/issues-closed/augustinbegue/icue-ambilight?color=green&style=flat-square)
![GitHub commits since latest release (by date)](https://img.shields.io/github/commits-since/augustinbegue/icue-ambilight/latest?style=flat-square)

### Build instructions :

-   Make sure you have installed the prerequisites for the [cue-sdk](https://github.com/CorsairOfficial/cue-sdk-node) package to work properly.
-   Install the required packages with `npm i --also=dev`
-   Start the application with `npm run start`
-   Build the application with `npm run dist`
