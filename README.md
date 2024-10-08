# Installation
- Install with npm
  `npm i videojsadx` OR
- Add hosted code link in <head>
  `https://cdn.jsdelivr.net/npm/videojsadx@[version_number]/dist/videojsadx.js`

Additionally have to add this script in "head" 
```html
<script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
``` 

# Description
VideoJS AdX combines videojs, video-ima, cotrib-ads to simply display videos with AdX integration

# Usage
Call function with your parameters

```html
<div class="stpd-video-container" id="video-container-1">
  <script>
    window.stpdVideo = window.stpdVideo || { que: [] };
    window.stpdVideo.que.push(function() {
    return window.stpdVideo.setConfig({
      videoSrc: 'https://example.com/uploads/my-video.mp4',
      thumbnailSrc: 'https://signe.stpd.io/wp-content/uploads/2023/06/1667-11.jpg',
      thumbnailTitle: 'Video title',
      initialAutoplay: true,
      muted: false,
      playlist: [
        { videoSrc: 'https://example.com/uploads/my-video-1.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail-1.jpg', thumbnailTitle:'Video title 1' },
        { videoSrc: 'https://example.com/uploads/my-video-2.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail-2.jpg' },
        { videoSrc: 'https://example.com/uploads/my-video-3.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail-3.jpg' }
      ],
      playlistAutoTitles: true,
      playlistAutoplay: true,
      miniPlayer: [
        { showOnlyOnAds: false, width: '400px', position: 'br', spacing: ['50px', '50px'] }
      ],
      miniPlayerMobile: [
        { showOnlyOnAds: false, width: '60%', position: 'bl', spacing: ['100px', '50%'] }
      ],
      adUnit: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&vid=short_onecue&correlator=',
      overlayAdElement: '<' + 'div id="my-ad">\n' +
              '<' + 'script type="text/javascript">\n' +
              'console.log("triggering some banner");\n' +
              '<' + '/script>\n' +
              '<' + '/div>',
      debug: true
    }, 'video-container-1');
    });
  </script>
</div>
```

Parameter description:
- `<div class="stpd-video-container" id="video-container-1">`
  - For multiple insertions change ID's for each element.
- `}, 'video-container-1');`
  - If ID changed, change here as well


- `videoSrc:`
  - Initial video on page load
- `thumbnailSrc:`
  - Initial video thumbnail
- `thumbnailTitle:`
  - Initial video title
- `initialAutoplay:`
  - Autoplay on page load
- `muted:`
  - Play with sound on page load (NB! If initial autoplay also is turned on, video won't autoplay until users first interaction with page (click) because of global enhancing user experience policy.)
- `playlist:`
  - Can be removed if no playlist required.
  - Initial video automatically included as the first playlist element
  - `videoSrc:`
    - Video source for playlist item
  - `thumbnailSrc:`
    - Thumbnail source for playlist item
    - If video source local, thumbnail will be autogenerated if not provided
  - `thumbnailTitle:`
    - Video title for playlist item
    - If any of playlist items has title, others will be auto populated
- `playlistAutoTitles:`
  - Automatically populate playlist items with titles even if none provided
- `playlistAutoplay:`
  - Playlist autoplay
- `miniPlayer:`
  - DESKTOP
  - Can be removed if no mini player required. 
  - `showOnlyOnAds:`
    - Show mini player only when ad is playing or all the time.
  - `width:`
    - Mini player width (px / % / ect). Height will be adjusted to aspect ratio.
  - `position:`
    - Values: { tl / tr / bl / br }
  - `spacing:`
    - Values: [ { t / b } px / % / ect , { l / r } px / % / ect ]
- `miniPlayerMobile:`
  - MOBILE
  - Can be removed if no mini player required.
  - `showOnlyOnAds:`
    - Show mini player only when ad is playing or all the time.
  - `width:`
    - Mini player width (px / % / ect). Height will be adjusted to aspect ratio.
  - `position:`
    - Values: { tl / tr / bl / br }
  - `spacing:`
    - Values: [ { t / b } px / % / ect , { l / r } px / % / ect ]
- `adUnit:`
  - AdX ad unit.
- `overlayAdElement:`
  - Overlay Ad tag code (with divs and stuff). (!NB <body> code only. If this is not an independent code, all <head> calls need to be added manually)
- `watermark:`
  - Values { true / false / URL } (Setupad logo enabled by default)
- `debug:`
  - Can be removed if no debug required

