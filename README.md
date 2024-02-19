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
      initialAutoplay: false,
      thumbnails: [
        { videoSrc: 'https://example.com/uploads/my-video.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail.jpg' },
        { videoSrc: 'https://example.com/uploads/my-video-2.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail-2.jpg' },
        { videoSrc: 'https://example.com/uploads/my-video-3.mp4', thumbnailSrc: 'https://example.com/uploads/my-video-thumbnail-3.jpg' }
      ],
      miniPlayer: [
        { showOnlyOnAds: false, width: 400, position: 'br', spacing: [50, 50] }
      ],
      miniPlayerMobile: [
        { showOnlyOnAds: false, width: 300, position: 'b', spacing: 100 }
      ],
      adUnit: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&vid=short_onecue&correlator=',    // adX ad unit
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
- `initialAutoplay:`
  - Autoplay on page load
- `thumbnails:`
  - Can be removed if no playlist required.
  - Include initial video as the first playlist element.
  - `videoSrc:`
    - Video source for playlist item
  - `thumbnailSrc:`
    - Thumbnail source for playlist item
- `miniPlayer:`
  - DESKTOP
  - Can be removed if no mini player required. 
  - `showOnlyOnAds:`
    - Show mini player only when ad is playing or all the time.
  - `width:`
    - Mini player width. Height will be adjusted to aspect ratio.
  - `position:`
    - Values: { tl / tr / bl / br }
  - `spacing:`
    - Values: [ { t / b } , { l / r } ]
- `miniPlayerMobile:`
  - MOBILE
  - Can be removed if no mini player required.
  - `showOnlyOnAds:`
    - Show mini player only when ad is playing or all the time.
  - `width:`
    - Mini player width. Height will be adjusted to aspect ratio.
  - `position:`
    - Values: { t / b }
  - `spacing:`
    - Values: { t / b }
- `adUnit:`
  - AdX ad unit.
- `debug:`
  - Can be removed if no debug required







