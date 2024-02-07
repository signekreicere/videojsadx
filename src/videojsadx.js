/*
 * ISC License
 *
 * Copyright (c) 2024, Signe Kreicere
 */

import 'video.js/dist/video-js.css';
import 'videojs-contrib-ads/dist/videojs.ads.css';
import 'videojs-ima/dist/videojs.ima.css';
import "./style.css";
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

(function (window) {
    'use strict';

    function stpdVideo(stpdVideo) {
        let defaultConfig = {
            videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
            initialAutoplay: false,
            thumbnails: [],
            miniPlayer: [],
            adUnit: '',
            debug: false
        };

        stpdVideo.setConfig = function (conf, containerId) {
            let elementConfig = { ...defaultConfig }; // Copy defaultConfig

            for (const key in conf) {
                if (typeof elementConfig[key] !== 'undefined') {
                    elementConfig[key] = conf[key];
                } else {
                    throw new Error("stpdVideo config key '" + key + "' not found");
                }
            }
            return { config: elementConfig, containerId };
        };

        stpdVideo.run = function ({ config, containerId }) {
            // Defining user configs
            let videoSrc = config.videoSrc;
            let initialAutoplay = config.initialAutoplay;
            let thumbnails = config.thumbnails || [];
            let adUnit = config.adUnit;
            let debug = config.debug;
            // Defining user configs: mini player
            let miniPlayer = config.miniPlayer || [];
            let miniPlayerOnlyOnAds;
            let miniPlayerPosition;
            let miniPlayerSpacingX;
            let miniPlayerSpacingY;
            if (miniPlayer.length > 0) {
                miniPlayerOnlyOnAds = config.miniPlayer[0].showOnlyOnAds;
                miniPlayerPosition = config.miniPlayer[0].position;
                miniPlayerSpacingX = config.miniPlayer[0].spacing[0];
                miniPlayerSpacingY = config.miniPlayer[0].spacing[1];
            }

            // Defining defaults
            let videoContainer = document.getElementById(containerId);let currentPageUrl = window.location.href;
            let encodedPageUrl = encodeURIComponent(currentPageUrl);
            let iterationId = Math.random().toString(36).substr(2, 9);
            let player;
            let adBreakActive = false;
            let initialized = false;
            let playlistItemClicked = false;
            // replacing [placeholder] with page URL or adding page URL
            if (adUnit.includes("[placeholder]")) {
                adUnit = adUnit.replace("[placeholder]", encodedPageUrl);
            } else {
                adUnit += "&description_url=" + encodedPageUrl;
            }
            if (debug) {console.log("Adunit url: " + adUnit);};

            // Defining elements
            let videoElementContainer;
            let videoElement;
            let scroller;
            let scrollerLeftBtn;
            let scrollerRightBtn;
            let scrollerThumbnails;
            let closeBtn;

            // Creating Video Element Structure + Initialise video
            function createVideoElement() {
                if (debug) {console.log(`Processed for ${containerId}`);};
                if (videoContainer) {
                    // Start creating HTML structure
                    let htmlContent = `
                    <div class="stpd-close-btn close-btn-hidden" id="${'close_button_' + iterationId}">
                        <svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
                            <line x1="0" y1="0" x2="15" y2="15" stroke="black" stroke-width="3"/>
                            <line x1="15" y1="0" x2="0" y2="15" stroke="black" stroke-width="3"/>
                        </svg>
                    </div>
                    <div class="stpd-video" id="${'stpd_video_' + iterationId}">
                        <video id="${'video_' + iterationId}" class="video-js vjs-default-skin vjs-16-9" controls preload="auto" muted>
                            <source src="${videoSrc}" type="video/mp4"/>
                        </video>
                    </div>`;

                    // Check if thumbnails exist and have a length greater than 0 to add scroller
                    if (thumbnails && thumbnails.length > 0) {
                        htmlContent += `
                        <div class="scroller-container">
                            <div class="navscroll leftscroll" id="${'leftscroll_' + iterationId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 12H6M12 19l-7-7 7-7"></path>
                                </svg>
                            </div>
                            <div class="scroller" id="${'scroller_' + iterationId}">`;

                        thumbnails.forEach(thumbnail => {
                            htmlContent += `
                                <div class="stpd-thumbnail-container" data-video-src="${thumbnail.videoSrc}">
                                    <img class="stpd-thumbnail-img" src="${thumbnail.thumbnailSrc}" alt="Video Thumbnail">
                                </div>`;
                        });

                        htmlContent += `
                            </div>
                            <div class="navscroll rightscroll" id="${'rightscroll_' + iterationId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M5 12h13M12 5l7 7-7 7"></path>
                                </svg>
                            </div>
                        </div>`;
                    }

                    videoContainer.innerHTML = htmlContent;

                    // Defining elements (giving actual values)
                    videoElementContainer = document.querySelector('#stpd_video_' + iterationId);
                    videoElement = document.querySelector('#video_' + iterationId);
                    scroller =  document.querySelector('#scroller_' + iterationId);
                    scrollerLeftBtn = document.querySelector('#leftscroll_' + iterationId);
                    scrollerRightBtn = document.querySelector('#rightscroll_' + iterationId);
                    scrollerThumbnails = document.querySelectorAll('#scroller_' + iterationId + ' > .stpd-thumbnail-container');
                    closeBtn = document.querySelector('#close_button_' + iterationId);

                    // Initialise videoJS
                    player = videojs(`video_${iterationId}`, {
                        controls: true,
                        autoplay: initialAutoplay,
                        preload: 'auto',
                    });

                    player.src({
                        type: 'video/mp4',
                        src: videoSrc,
                    });

                    initializeAds();
                } else {
                    console.error('Container element with id ' + containerId + ' not found.');
                }

                if (thumbnails && thumbnails.length > 0) {
                    runScrollerScripts();
                }
            }


            function initializeAds() {
                // Remove controls from the player on iPad to stop native controls from stealing click
                if ((navigator.userAgent.match(/iPad/i) ||
                        navigator.userAgent.match(/Android/i)) &&
                    videoElement.hasAttribute('controls')) {
                    videoElement.removeAttribute('controls');
                }

                // Start ads when the video player is clicked, but only the first time it's clicked.
                var startEvent = 'click';
                if (navigator.userAgent.match(/iPhone/i) ||
                    navigator.userAgent.match(/iPad/i) ||
                    navigator.userAgent.match(/Android/i)) {
                    startEvent = 'touchend';
                }

                var boundInitFromStart = initFromStart.bind(null, player);
                videoElement.addEventListener(startEvent, boundInitFromStart);

                var options = {
                    id: 'video_' + iterationId,
                    adTagUrl: adUnit + '&description_url=' + encodedPageUrl,
                    adsManagerLoadedCallback: adsManagerLoadedCallback.bind(null, player)
                };

                if (scroller) {
                    var playlistItems = scroller.childNodes;
                    for (var index in playlistItems) {
                        if (playlistItems[index].tagName == 'DIV') {
                            playlistItems[index].addEventListener(
                                'click',
                                onPlaylistItemClick.bind(null, player),
                                false
                            );
                        }
                    }
                }

                player.ima(options);

                function initFromStart(player) {
                    if (!initialized) {
                        init(player);
                        videoElement.removeEventListener(startEvent, boundInitFromStart);
                    }
                }

                function init(player) {
                    initialized = true;
                    player.ima.initializeAdDisplayContainer();
                }

                // Gathering ad events
                function adsManagerLoadedCallback(player) {
                    var events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                        google.ima.AdEvent.Type.CLICK,
                        google.ima.AdEvent.Type.COMPLETE,
                        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                        google.ima.AdEvent.Type.FIRST_QUARTILE,
                        google.ima.AdEvent.Type.LOADED,
                        google.ima.AdEvent.Type.MIDPOINT,
                        google.ima.AdEvent.Type.PAUSED,
                        google.ima.AdEvent.Type.STARTED,
                        google.ima.AdEvent.Type.THIRD_QUARTILE];
                    for (var index = 0; index < events.length; index++) {
                        player.ima.addEventListener(
                            events[index],
                            onAdEvent.bind(null)
                        );
                    }

                    if (playlistItemClicked) {
                        player.play();
                        if (debug) {console.log(containerId + ": Force playing video");};
                    }
                }

                // Checking if ad is playing + logging ad events
                function onAdEvent(event) {
                    if (event.type == google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED) {
                        adBreakActive = true;
                    } else if (event.type == google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED) {
                        adBreakActive = false;
                    } else {
                        if (debug) {console.log(containerId + ': Ad event:', event.type);};
                    }
                }

                // Thumbnails: Request ads on video change + force play video with playlistItemClicked
                function onPlaylistItemClick(player, event) {
                    if (!adBreakActive) {
                        if (!initialized) {
                            init(player);
                        }
                        player.ima.setContentWithAdTag(null);
                        player.ima.requestAds();
                    } else {
                        if (debug) {console.log(containerId + ": Change video: Wait for Ad to finish.");};
                    }
                    playlistItemClicked = true;
                }
            }


            // Mini player: Check if big player out of view
            function isElementOutOfView(el) {
                const rect = el.getBoundingClientRect();
                return (
                    rect.bottom <= 0 ||
                    rect.top >= (window.innerHeight || document.documentElement.clientHeight)
                );
            }

            // Mini player: Show miniPlayer setting is configured + check of when to show it
            function showMiniPlayer() {
                let shouldShowMiniPlayer = ( ( (miniPlayer.length > 0) && !miniPlayerOnlyOnAds) || ( (miniPlayer.length > 0) && miniPlayerOnlyOnAds && adBreakActive) );
                if (shouldShowMiniPlayer && isElementOutOfView(videoContainer)) {
                    videoElementContainer.classList.add('stpd-video-fixed');
                    closeBtn.classList.remove('close-btn-hidden');
                    miniPlayerPositioning ();
                } else {
                    videoElementContainer.classList.remove('stpd-video-fixed');
                    closeBtn.classList.add('close-btn-hidden');
                    clearMiniPlayerPositioning();
                }
            }

            // Mini player: Set position based on configs
            function miniPlayerPositioning () {
                if (miniPlayerPosition == 'tl') {
                    videoElementContainer.style.cssText += "top: " + (miniPlayerSpacingX + 28) + "px;" + "left: " + miniPlayerSpacingY + "px;";
                    closeBtn.style.cssText += "top: " + miniPlayerSpacingX + "px;" + "left: " + miniPlayerSpacingY + "px;";
                } else if (miniPlayerPosition == 'tr') {
                    videoElementContainer.style.cssText += "top: " + (miniPlayerSpacingX + 28) + "px;" + "right: " + miniPlayerSpacingY + "px;";
                    closeBtn.style.cssText += "top: " + miniPlayerSpacingX + "px;" + "right: " + miniPlayerSpacingY + "px;";
                } else if (miniPlayerPosition == 'bl') {
                    videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingX + "px;" + "left: " + miniPlayerSpacingY + "px;";
                    closeBtn.style.cssText += "bottom: " + (miniPlayerSpacingX + 150) + "px;" + "left: " + miniPlayerSpacingY + "px;";
                } else if (miniPlayerPosition == 'br') {
                    videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingX + "px;" + "right: " + miniPlayerSpacingY + "px;";
                    closeBtn.style.cssText += "bottom: " + (miniPlayerSpacingX + 150) + "px;" + "right: " + miniPlayerSpacingY + "px;";
                }
            }

            // Mini player: Remove - Set position based on configs
            function clearMiniPlayerPositioning() {
                ['top', 'bottom', 'left', 'right'].forEach(property => {
                    videoElementContainer.style.removeProperty(property);
                    closeBtn.style.removeProperty(property);
                });
            }

            // Mini player: Close button
            function closeMiniPlayer() {
                closeBtn.addEventListener('click', function () {
                    videoElementContainer.classList.remove('stpd-video-fixed');
                    closeBtn.classList.add('close-btn-hidden');
                    showMiniPlayer = null;
                });
            }

            // Thumbnails: Disable if ad is active
            function toggleVideoScroller(adActive) {
                if (thumbnails && thumbnails.length > 0) {
                    let opacityValue = adActive ? 0.5 : 1;
                    let cursorValue = adActive ? 'default' : 'pointer';
                    scroller.style.opacity = opacityValue;
                    scrollerThumbnails.forEach(function (thumbnail) {
                        thumbnail.style.opacity = opacityValue;
                        thumbnail.style.cursor = cursorValue;
                    });
                }
            }

            // Thumbnails: Scrollability
            function scroll(direction) {
                if (thumbnails && thumbnails.length > 0) {
                    const currentScroll = scroller.scrollLeft;
                    const targetScroll = direction === 'left' ? currentScroll - 150 : currentScroll + 150;

                    scroller.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                    updateButtonOpacity(scroller);
                }
            }

            // Thumbnails: Change source
            function thumbnailLinks() {
                if (thumbnails && thumbnails.length > 0) {
                    scrollerThumbnails.forEach(function (thumbnail) {
                        thumbnail.addEventListener('click', function () {
                            if (!adBreakActive) {
                                let videoSrc = thumbnail.getAttribute('data-video-src');
                                player.src(videoSrc);
                                if (debug) {console.log(containerId + ": Playlist item clicked, changing source");};
                            }
                        });
                    });
                }
            }

            // Thumbnails: Greys out SCROLL buttons if list at the end
            function updateButtonOpacity(scroller) {
                if (thumbnails && thumbnails.length > 0) {
                    const tolerance = 1;
                    const leftScroll = Math.floor(scroller.scrollLeft);
                    const clientWidth = Math.floor(scroller.clientWidth);
                    const rightEdge = leftScroll + clientWidth + tolerance;
                    const scrollWidth = Math.floor(scroller.scrollWidth);
                    const isAtLeftEdge = leftScroll <= tolerance;
                    const isAtRightEdge = rightEdge >= scrollWidth;

                    scrollerLeftBtn.style.opacity = isAtLeftEdge ? '0.2' : '1';
                    scrollerLeftBtn.style.cursor = isAtLeftEdge ? 'default' : 'pointer';

                    scrollerRightBtn.style.opacity = isAtRightEdge ? '0.2' : '1';
                    scrollerRightBtn.style.cursor = isAtRightEdge ? 'default' : 'pointer';
                }
            }


            // Thumbnails: Related function calls - runScrollerScripts () called in createVideoElement() after all elements generated
            function runScrollerScripts () {
                scroller.addEventListener('scroll', function () {
                    updateButtonOpacity(this);
                });
                scrollerLeftBtn.addEventListener('click', function () {
                    scroll('left');
                });
                scrollerRightBtn.addEventListener('click', function () {
                    scroll('right');
                });
            };


            window.addEventListener("load", () => { createVideoElement(), updateButtonOpacity(scroller), thumbnailLinks(), showMiniPlayer(), closeMiniPlayer() });
            window.addEventListener('scroll', () => { showMiniPlayer() });

        };


        if (stpdVideo.que.length > 0) {
            while (stpdVideo.que.length > 0) {
                try {
                    const item = stpdVideo.que.shift();
                    stpdVideo.run(item);
                } catch (err) {
                    throw new Error(err);
                }
            }
        }

        stpdVideo.que.push = function (q) {
            const item = q();
            stpdVideo.run(item);
        }

        return stpdVideo;
    }

    window.stpdVideo = stpdVideo(window.stpdVideo || { que: [] });

})(window);
