/*
 * ISC License
 *
 * Copyright (c) 2024, Signe Kreicere
 */


import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-ads/dist/videojs.ads.css';
import 'videojs-ima/dist/videojs.ima.css';
import "./style.css";
import 'videojs-contrib-ads';
import 'videojs-ima';
import stpdLogoImage from './assets/setupad-short.svg';

(function (window) {
    'use strict';

    function stpdVideo(stpdVideo) {
        let defaultConfig = {
            videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailSrc: '',
            thumbnailTitle: '',
            initialAutoplay: false,
            playlist: [],
            playlistAutoTitles: false,
            playlistAutoplay: false,
            miniPlayer: [],
            miniPlayerMobile: [],
            adUnit: '',
            debug: false
        };

        stpdVideo.setConfig = function (conf, containerId) {
            let elementConfig = { ...defaultConfig }; // Copy defaultConfig

            for (const key in conf) {
                if (typeof elementConfig[key] !== 'undefined') {
                    elementConfig[key] = conf[key];
                } else {
                    throw new Error("stpdVideo config key '" + key + "' not populateTitle");
                }
            }
            return { config: elementConfig, containerId };
        };

        stpdVideo.run = function ({ config, containerId }) {
            // Defining user configs
            let videoSrc = config.videoSrc;
            let thumbnailSrc = config.thumbnailSrc;
            let thumbnailTitle = config.thumbnailTitle;
            let initialAutoplay = config.initialAutoplay;
            let playlist = config.playlist || [];
            let playlistAutoTitles = config.playlistAutoTitles;
            let playlistAutoplay = config.playlistAutoplay;
            let adUnit = config.adUnit;
            let debug = config.debug;
            // Defining user configs: mini player
            // For desktop
            let miniPlayer = config.miniPlayer || [];
            let miniPlayerOnlyOnAds;
            let miniPlayerSize;
            let miniPlayerPosition;
            let miniPlayerSpacingX;
            let miniPlayerSpacingY;
            if (miniPlayer.length > 0) {
                miniPlayerOnlyOnAds = config.miniPlayer[0].showOnlyOnAds;
                miniPlayerSize = config.miniPlayer[0].width;
                miniPlayerPosition = config.miniPlayer[0].position;
                miniPlayerSpacingX = config.miniPlayer[0].spacing[0];
                miniPlayerSpacingY = config.miniPlayer[0].spacing[1];
            }
            // For mobile
            let miniPlayerMobile = config.miniPlayerMobile || [];
            let miniPlayerOnlyOnAdsMobile;
            let miniPlayerSizeMobile;
            let miniPlayerPositionMobile;
            let miniPlayerSpacingXMobile;
            let miniPlayerSpacingYMobile;
            if (miniPlayerMobile.length > 0) {
                miniPlayerOnlyOnAdsMobile = config.miniPlayerMobile[0].showOnlyOnAds;
                miniPlayerSizeMobile = config.miniPlayerMobile[0].width;
                miniPlayerPositionMobile = config.miniPlayerMobile[0].position;
                miniPlayerSpacingXMobile = config.miniPlayerMobile[0].spacing[0];
                miniPlayerSpacingYMobile = config.miniPlayerMobile[0].spacing[1];
            }

            // Defining defaults
            let videoContainer = document.getElementById(containerId);let currentPageUrl = window.location.href;
            let encodedPageUrl = encodeURIComponent(currentPageUrl);
            let iterationId = Math.random().toString(36).substr(2, 9);
            let isMobile = (top.window.innerWidth <= 767);
            if (debug) {console.log("Window inner width: " + top.window.innerWidth);};
            let player;
            let adBreakActive = false;
            let initialized = false;
            let playlistItemClicked = false;
            let playlistProgressIndex = 0;
            let playlistClickedIndex = -1;
            let populatedAdUnit;
            let videoDuration;
            let videoEnded = false;
            let closeBtnHiddenRemoved = false;
            let miniPlayerClosed;
            let playerPaused = false;
            let playerManuallyPaused = false;

            // Defining elements
            let videoElementContainer;
            let videoElement;
            let scroller;
            let scrollerLeftBtn;
            let scrollerRightBtn;
            let scrollerThumbnails;
            let closeBtn;
            let videoPlaceholder;
            let stpdLogo;
            let adTagUrl

            // Creating Video Element Structure + initialize video
            function createVideoElement() {
                if (debug) {console.log(`Processed for ${containerId}`);};
                if (videoContainer) {
                    // Start creating HTML structure
                    let htmlContent = `
                    <div class="stpd-video" id="${'stpd_video_' + iterationId}">
                        <a id="${'stpdLogo_' + iterationId}" class="stpdLogo" href="https://setupad.com/"><img src="${stpdLogoImage}"></a>  
                        <div class="stpd-close-btn close-btn-hidden" id="${'close_button_' + iterationId}">
                            <svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0" y1="0" x2="15" y2="15" stroke="white" stroke-width="3"/>
                                <line x1="15" y1="0" x2="0" y2="15" stroke="white" stroke-width="3"/>
                            </svg>
                        </div>
                        <video id="${'video_' + iterationId}" class="video-js vjs-default-skin vjs-16-9" controls preload="auto" muted>
                            <source src="${videoSrc}" type="video/mp4"/>
                        </video>
                    </div>`;

                    // Check if playlist exist and have a length greater than 0 to add scroller
                    if (playlist && playlist.length > 0) {
                        // Populate playlist with initial video
                        let initialVideo = {videoSrc: videoSrc, thumbnailSrc: thumbnailSrc, thumbnailTitle: thumbnailTitle}
                        playlist = [initialVideo, ...playlist];
                        if (debug) { console.log(playlist);};

                        // Scroller generation
                        htmlContent += `
                        <div class="scroller-container">
                            <div class="navscroll leftscroll" id="${'leftscroll_' + iterationId}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 12H6M12 19l-7-7 7-7"></path>
                                </svg>
                            </div>
                            <div class="scroller" id="${'scroller_' + iterationId}">`;

                            playlist.forEach(thumbnail => {
                                var thumbID = 'thumb_img_' + Math.random().toString(36).substr(2, 9);
                                var durationID = 'vid_dur_' + Math.random().toString(36).substr(2, 9);
                                htmlContent += `
                                    <div class="stpd-thumbnail-container" data-video-src="${thumbnail.videoSrc}">
                                        <img class="stpd-thumbnail-img" id="${thumbID}" src="${thumbnail.thumbnailSrc}" alt="Video Thumbnail">
                                        <span class="video-duration" id="${durationID}"></span>`;
                                    if (thumbnail.thumbnailTitle){
                                        htmlContent += `<div class="video-title">${thumbnail.thumbnailTitle}</div>`;
                                    }
                                htmlContent += `
                                    </div>`;
                                if (!thumbnail.thumbnailSrc){
                                    generateThumbnails(thumbnail.videoSrc, thumbID)
                                };
                                getVideoDuration(thumbnail.videoSrc, durationID);
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
                    htmlContent += `
                        <div class="stpd-video-placeholder d-none" id="${'stpd-video-placeholder_' + iterationId}"></div>
                    `;

                    videoContainer.innerHTML = htmlContent;

                    // Defining elements (giving actual values)
                    videoElementContainer = document.querySelector('#stpd_video_' + iterationId);
                    videoElement = document.querySelector('#video_' + iterationId);
                    scroller = document.querySelector('#scroller_' + iterationId);
                    scrollerLeftBtn = document.querySelector('#leftscroll_' + iterationId);
                    scrollerRightBtn = document.querySelector('#rightscroll_' + iterationId);
                    scrollerThumbnails = document.querySelectorAll('#scroller_' + iterationId + ' > .stpd-thumbnail-container');
                    closeBtn = document.querySelector('#close_button_' + iterationId);
                    videoPlaceholder = document.querySelector('#stpd-video-placeholder_' + iterationId);
                    videoPlaceholder = document.querySelector('#stpd-video-placeholder_' + iterationId);
                    stpdLogo = document.querySelector('#stpdLogo_' + iterationId);

                    // initialize videoJS
                    player = videojs(`video_${iterationId}`, {
                        controls: true,
                        autoplay: initialAutoplay,
                        preload: 'auto',
                        playsinline: true,
                        debug: true
                    });

                    player.src({
                        type: 'video/mp4',
                        src: videoSrc,
                    });

                    // Populate AdUnitUrl: replacing [placeholder] with page URL or adding page URL
                    if (adUnit.includes("[placeholder]")) {
                        adUnit = adUnit.replace("[placeholder]", encodedPageUrl);
                    } else {
                        adUnit += "&description_url=" + encodedPageUrl;
                    }

                    adUnit = adUnit + "vid_d=10000";

                    initializeAds();
                    setPlaceholderHeight();
                    if (playlistAutoplay == true) {
                        videoEndedCheck(player);
                    }

                } else {
                    console.error('Container element with id ' + containerId + ' not populateTitle.');
                }

                if (playlist && playlist.length > 0) {
                    runScrollerScripts();
                    trackPlaylist();
                    generateTitle(playlistAutoTitles);
                }
            }


            // Intitialise ads
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
                    adTagUrl: adUnit,
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
                        showMiniPlayer();
                    } else if (event.type == google.ima.AdEvent.Type.ALL_ADS_COMPLETED) {
                        console.log("ads have ended, video can be resumed");
                        autoplayPlaylist(player);
                    } else {
                        if (debug) {console.log(containerId + ': Ad event:', event.type);};
                    }
                }

                // Playlist: Request ads on video change + force play video with playlistItemClicked
                function onPlaylistItemClick(player, event) {
                    if (!adBreakActive) {
                        if (!initialized) {
                            init(player);
                        }
                        player.ima.setContentWithAdTag(null);
                        player.ima.requestAds();
                        if (debug) {console.log("AdUnit url: " + adUnit);};
                    } else {
                        if (debug) {console.log(containerId + ": Change video: Wait for Ad to finish.");};
                    }
                    playlistItemClicked = true;
                }
            }

            // Global: Check if big player out of view
            function isElementOutOfView(el) {
                const rect = el.getBoundingClientRect();
                return (
                    rect.bottom <= 0 ||
                    rect.top >= (window.innerHeight || document.documentElement.clientHeight)
                );
            }

            // Global: Pause video if player out of view
            function pausePlayer() {
                if ( ((isElementOutOfView(videoContainer)) && ((miniPlayer.length <= 0 || miniPlayerClosed) && !isMobile) && !playerManuallyPaused) ||
                    ((isElementOutOfView(videoContainer)) && ((miniPlayerMobile.length <= 0 || miniPlayerClosed) && isMobile) && !playerManuallyPaused) ) {

                    if (!playerPaused) {
                        player.pause();
                        playerPaused = true;
                    }
                } else {
                    if (playerPaused) {
                        player.play();
                        playerPaused = false;
                    }
                }
            }

            // Global: Track user interactions (pause/play) with the video player
            function handlePlayerInteractions() {
                if (videoElement) {
                    videoElement.addEventListener('click', function() {
                        if (player.paused()) {
                            playerManuallyPaused = false;
                        } else {
                            playerManuallyPaused = true;
                        }
                    });
                }
            }


            // Mini player: Set height for placeholder
            function setPlaceholderHeight() {
                let videoHeight = videoElementContainer.offsetHeight;
                videoPlaceholder.style.height = videoHeight + 'px';
            }

            // Mini player: Show miniPlayer setting is configured + check of when to show it
            function showMiniPlayer() {
                let shouldShowMiniPlayer = (
                    ((initialAutoplay || (!player.paused() || adBreakActive)) && ((( (miniPlayer.length > 0 ) ) && !miniPlayerOnlyOnAds) ||
                        (( (miniPlayer.length > 0) ) && miniPlayerOnlyOnAds && adBreakActive)) && !isMobile && !miniPlayerClosed) ||
                    ((initialAutoplay || (!player.paused() || adBreakActive)) && ((( (miniPlayerMobile.length > 0) ) && !miniPlayerOnlyOnAdsMobile) ||
                        (( (miniPlayerMobile.length > 0) ) && miniPlayerOnlyOnAdsMobile && adBreakActive)) && isMobile && !miniPlayerClosed)
                );

                if (shouldShowMiniPlayer && isElementOutOfView(videoContainer)) {
                    videoPlaceholder.classList.remove('d-none');
                    videoElementContainer.classList.add('stpd-video-fixed');
                    if (!closeBtnHiddenRemoved) {
                        setTimeout(() => {
                            closeBtn.classList.remove('close-btn-hidden');
                            closeBtnHiddenRemoved = true;
                        }, 3000);
                    } else {
                        closeBtn.classList.remove('close-btn-hidden');
                    }
                    miniPlayerPositioning ();
                } else {
                    videoPlaceholder.classList.add('d-none');
                    videoElementContainer.classList.remove('stpd-video-fixed');
                    closeBtn.classList.add('close-btn-hidden');
                    clearMiniPlayerPositioning();
                }
            }

            // Mini player: Set position based on configs
            function miniPlayerPositioning () {
                if (isMobile) {
                    videoElementContainer.style.cssText += "width: " + miniPlayerSizeMobile + "; height: unset;";
                    if (miniPlayerPositionMobile == 'tl') {
                        videoElementContainer.style.cssText += "top: " + miniPlayerSpacingXMobile + ";" + "left: " + miniPlayerSpacingYMobile + ";";
                    } else if (miniPlayerPositionMobile == 'tr') {
                        videoElementContainer.style.cssText += "top: " + miniPlayerSpacingXMobile + ";" + "right: " + miniPlayerSpacingYMobile + ";";
                    } else if (miniPlayerPositionMobile == 'bl') {
                        videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingXMobile + ";" + "left: " + miniPlayerSpacingYMobile + ";";
                    } else if (miniPlayerPositionMobile == 'br') {
                        videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingXMobile + ";" + "right: " + miniPlayerSpacingYMobile + ";";
                    }
                } else {
                    videoElementContainer.style.cssText += "width: " + miniPlayerSize + "; height: unset;";
                    if (miniPlayerPosition == 'tl') {
                        videoElementContainer.style.cssText += "top: " + miniPlayerSpacingX + ";" + "left: " + miniPlayerSpacingY + ";";
                    } else if (miniPlayerPosition == 'tr') {
                        videoElementContainer.style.cssText += "top: " + miniPlayerSpacingX + ";" + "right: " + miniPlayerSpacingY + ";";
                    } else if (miniPlayerPosition == 'bl') {
                        videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingX + ";" + "left: " + miniPlayerSpacingY + ";";
                    } else if (miniPlayerPosition == 'br') {
                        videoElementContainer.style.cssText += "bottom: " + miniPlayerSpacingX + ";" + "right: " + miniPlayerSpacingY + ";";
                    }
                }
            }

            // Mini player: Remove - Set position based on configs
            function clearMiniPlayerPositioning() {
                ['top', 'bottom', 'left', 'right', 'width'].forEach(property => {
                    videoElementContainer.style.removeProperty(property);
                    videoElementContainer.style.cssText += "height: 100%;";
                });
            }

            // Mini player: Close button
            function closeMiniPlayer() {
                closeBtn.addEventListener('click', function () {
                    videoPlaceholder.classList.add('d-none');
                    videoElementContainer.classList.remove('stpd-video-fixed');
                    closeBtn.classList.add('close-btn-hidden');
                    player.pause();
                    clearMiniPlayerPositioning();
                    miniPlayerClosed = true;
                    playerManuallyPaused = true;
                });
            }


            // Playlist: Generate item thumbnail if none provided. Works only on local urls
            function generateThumbnails(videoSrc, thumbID) {
                const videoT = document.createElement('video');
                videoT.src = videoSrc;

                videoT.addEventListener('loadedmetadata', function() {
                    videoT.currentTime = 5;
                    videoT.pause();

                    videoT.addEventListener('canplay', function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = videoT.videoWidth;
                        canvas.height = videoT.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(videoT, 0, 0, canvas.width, canvas.height);
                        const imgElement = document.getElementById(thumbID);
                        if (imgElement) {
                            imgElement.src = canvas.toDataURL();
                        }
                        videoT.remove();
                    });
                });
            }

            // Playlist: Generate title from URL
            function generateTitle(t) {
                let populateTitle = false;
                if (t) { populateTitle = true; }

                for (let i = 0; i < scrollerThumbnails.length; i++) {
                    const thumbnail = scrollerThumbnails[i];
                    const videoTitle = thumbnail.querySelector('.video-title');
                    if (videoTitle) {
                        populateTitle = true;
                        break;
                    }
                }

                function cleanUpTitle(url) {
                    const fileName = url.split('/').pop();
                    const fileNameWithoutExtension = fileName.split('.')[0];
                    const cleanedFileName = fileNameWithoutExtension.replace(/_/g, ' ');
                    const words = cleanedFileName.split('-').map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
                    const title = words.join(' ');
                    return title;
                }

                if (populateTitle) {
                    scrollerThumbnails.forEach((thumbnail, index) => {
                        const videoTitle = thumbnail.querySelector('.video-title');

                        if (!videoTitle) {
                            const videoSrc = thumbnail.getAttribute('data-video-src');
                            const newTitleElement = document.createElement('div');
                            newTitleElement.className = 'video-title';
                            const cleanedTitle = cleanUpTitle(videoSrc);
                            newTitleElement.textContent = cleanedTitle;
                            thumbnail.appendChild(newTitleElement);
                        }
                    });
                }
            }

            // Playlist: Generate playlist item duration
            function getVideoDuration(videoSrc, durationID) {
                const video = document.createElement('video');
                video.src = videoSrc;

                video.addEventListener('loadedmetadata', function() {
                    const duration = video.duration;
                    video.remove();

                    var minutes = Math.floor(duration / 60);
                    var remainingSeconds = Math.floor(duration % 60);
                    var formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
                    var formattedDuration = minutes + ':' + formattedSeconds;

                    const durationElement = document.getElementById(durationID);
                    durationElement.innerHTML = formattedDuration;
                });

                document.body.appendChild(video);
            }

            // Playlist: Scrollability
            function scroll(direction) {
                if (playlist && playlist.length > 0) {
                    const currentScroll = scroller.scrollLeft;
                    const targetScroll = direction === 'left' ? currentScroll - 150 : currentScroll + 150;

                    scroller.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                    updateButtonOpacity(scroller);
                }
            }

            // Playlist: Disable if ad is active
            function toggleVideoScroller(adActive) {
                if (playlist && playlist.length > 0) {
                    let opacityValue = adActive ? 0.5 : 1;
                    let cursorValue = adActive ? 'default' : 'pointer';
                    scroller.style.opacity = opacityValue;
                    scrollerThumbnails.forEach(function (thumbnail) {
                        thumbnail.style.opacity = opacityValue;
                        thumbnail.style.cursor = cursorValue;
                    });
                }
            }

            // Playlist: Greys out SCROLL buttons if list at the end
            function updateButtonOpacity(scroller) {
                if (playlist && playlist.length > 0) {
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

            // Playlist: track current video
            function trackPlaylist(trigger, index) {
                const currentVideo = scroller.querySelectorAll('.stpd-thumbnail-container')[playlistProgressIndex];
                if (index !== undefined && index >= 0 && index < playlist.length) {
                    playlistProgressIndex = index;
                }
                if (trigger > 0 || trigger === 0) {
                    currentVideo.classList.remove('active');
                    if (trigger === 1) {
                        playlistProgressIndex = (playlistProgressIndex + 1) % playlist.length;
                    }
                }
                const nextVideo = scroller.querySelectorAll('.stpd-thumbnail-container')[playlistProgressIndex];
                nextVideo.classList.add('active');
                if (debug){console.log("current playlist index: " + playlistProgressIndex);};
            }

            // Playlist: Check if video ended, call for next video
            function videoEndedCheck(p) {
                p.on('ended', function() {
                    videoEnded = true;
                    if (debug) {console.log("video has ended: " + videoEnded);};
                    autoplayPlaylist(p)
                });
            }

            // Playlist: Request ads on video change + change video source to next video in playlist and play it
            function autoplayPlaylist(player) {
                if (!adBreakActive && videoEnded) {
                    trackPlaylist(1);
                    const nextVideoSrc = scrollerThumbnails[playlistProgressIndex].getAttribute('data-video-src');
                    player.src(nextVideoSrc);
                    player.ima.setContentWithAdTag(null);
                    player.ima.requestAds();
                    if (debug) {console.log("AdUnit url: " + adUnit);};
                    player.play();
                    videoEnded = false;
                } else {
                    if (debug) {console.log(containerId + ": Change video: Wait for Ad to finish.");};
                }
            }

            // Playlist: Change source on click
            function playlistLinks() {
                if (playlist && playlist.length > 0) {
                    scrollerThumbnails.forEach(function(thumbnail, index) {
                        thumbnail.addEventListener('click', function() {
                            if (!adBreakActive) {
                                const clickedIndex = index;
                                videoSrc = thumbnail.getAttribute('data-video-src');
                                player.src(videoSrc);
                                player.play();
                                trackPlaylist(0, clickedIndex);
                            }
                        });
                    });
                }
            }

            // Playlist: Related function calls - runScrollerScripts () called in createVideoElement() after all elements generated
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


            window.addEventListener("load", () => { createVideoElement(), updateButtonOpacity(scroller), playlistLinks(), showMiniPlayer(), closeMiniPlayer(), pausePlayer(), handlePlayerInteractions(); });
            window.addEventListener('scroll', () => { showMiniPlayer(), pausePlayer(); });

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