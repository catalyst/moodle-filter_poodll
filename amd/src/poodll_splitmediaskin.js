/* jshint ignore:start */
define(['jquery','core/log','filter_poodll/utils_amd'], function($, log, utils) {

    "use strict"; // jshint ;_;

    log.debug('PoodLL split Skin: initialising');

    return {
    
        instanceprops: null,
        pmr: null,
        uploaded: false,
        recorded: false,
        played: false,
        mustResetResourcePlayer : false,

        //for making multiple instances
        clone: function(){
            return $.extend(true,{},this);
        },

        init: function(ip, pmr){
            this.instanceprops=ip;
            this.pmr=pmr;
        },


        fetch_instanceprops : function(){
            return this.instanceprops;
        },


        onUploadSuccess: function(controlbarid){
             $('#' + controlbarid + ' > .poodll_save-recording').hide();
            // $('#' + controlbarid  + '_messages').hide();
             $('#' + controlbarid + ' > .poodll_savedsuccessfully').show();
        },
        
        onUploadFailure: function(controlbarid){
            return;
        },		

        fetch_status_bar: function(skin){
            var status = '<div class="poodll_status_' + skin + '"></div>';
            return status;
        },
        
        fetch_preview_audio: function(skin){
            var checkplayer = '<audio class="poodll_checkplayer_' + skin + ' hide" controls></audio>';
            return checkplayer;
        },
        fetch_preview_video: function(skin){
            var checkplayer ='<video class="poodll_checkplayer_' + skin + '" width="320" height="240"></video>';
            return checkplayer;
        },
        fetch_resource_audio: function(skin){
            var resourceplayer = '<audio class="poodll_resourceplayer_' + skin + ' hide" src="@@RESOURCEURL@@" playsinline controls></audio>';
            return resourceplayer;
        },
        fetch_resource_video: function(skin){
            var resourceplayer = '<video class="poodll_resourceplayer_' + skin + ' hide" src="@@RESOURCEURL@@" ></video>';
            return resourceplayer;
        },
        onMediaError: function(e) {
                console.error('media error', e);
        },

        onMediaSuccess_video: function(controlbarid){
            var ip = this.fetch_instanceprops(controlbarid);
            ip.controlbar.stopbutton.attr('disabled',false);
            ip.controlbar.savebutton.attr('disabled',false);
        },

        onMediaSuccess_audio: function(controlbarid){
            var ip = this.fetch_instanceprops(controlbarid);
            ip.controlbar.checkplayer.attr('src',null);
            ip.controlbar.stopbutton.attr('disabled',false);;
            ip.controlbar.savebutton.attr('disabled',false);
        },

        handle_timer_update: function(controlbarid){
            if(!this.played && !this.recorded){return;}
            var ip = this.fetch_instanceprops(controlbarid);
            var recordingstring = M.util.get_string('recui_recording','filter_poodll');
            this.update_status(controlbarid, recordingstring + ip.timer.fetch_display_time());
            if(ip.timer.seconds==0 && ip.timer.initseconds >0){
                 ip.controlbar.stopbutton.click();
            }
        },

       update_status: function(controlbarid, text){
            var ip = this.fetch_instanceprops(controlbarid);
            ip.controlbar.status.html(text);
        },

        //set visuals for different states (ie recording or playing)
        set_visual_mode: function(mode, ip){
            var self = this;

           switch(mode) {

               case 'recordingmode':
                   self.disable_button(ip.controlbar.resourceplaybutton);
                   ip.controlbar.resourceplaybutton.empty();
                   ip.controlbar.resourceplaybutton.html('<span class="fa fa-microphone fa-4x"></span>');
                   ip.controlbar.resourceplaybutton.addClass('poodll_mediarecorderholder_split_recordcolor');
                   ip.controlbar.status.addClass('poodll_mediarecorderholder_split_recordcolor');
                   self.handle_timer_update(ip.controlbarid);
                   self.enable_button(ip.controlbar.stopbutton);
                   break;

               case 'resourceplayingmode':
                   self.disable_button(ip.controlbar.resourceplaybutton);
                   self.disable_button(ip.controlbar.stopbutton);
                   break;


               case 'neverrecordedmode':
                   ip.controlbar.resourceplaybutton.empty();
                   if (ip.config.resource == '') {
                        ip.controlbar.resourceplaybutton.html('<span class="fa fa-microphone fa-4x"></span>');
                    }else{
                       ip.controlbar.resourceplaybutton.html('<span class="fa fa-play-circle fa-4x"></span>');
                   }

                   self.enable_button(ip.controlbar.resourceplaybutton);
                   self.disable_button(ip.controlbar.stopbutton);

                   this.update_status(ip.controlbarid,M.util.get_string('recui_ready','filter_poodll'));
                       break;
                    
              case 'allstoppedmode':
                  self.disable_button(ip.controlbar.resourceplaybutton);
                  self.disable_button(ip.controlbar.stopbutton);
                  ip.controlbar.resourceplaybutton.empty();
                  ip.controlbar.resourceplaybutton.html('<span class="fa fa-check fa-4x"></span>');
                  ip.controlbar.resourceplaybutton.removeClass('poodll_mediarecorderholder_split_recordcolor');
                  ip.controlbar.status.removeClass('poodll_mediarecorderholder_split_recordcolor');
                  this.update_status(ip.controlbarid,M.util.get_string('recui_finished','filter_poodll'));
                break;
           }

       },

        //insert the control bar and return it to be reused
        insert_controlbar_video: function(element, controlbarid, checkplayer,resourceplayer) {
            var controlbar = this.prepare_controlbar(element,controlbarid, checkplayer,resourceplayer,'video');
        	return controlbar;
        },
        //insert the control bar and return it to be reused
        insert_controlbar_audio: function(element,controlbarid, checkplayer,resourceplayer){
        	var controlbar = this.prepare_controlbar(element,controlbarid, checkplayer,resourceplayer,'audio');
        	return controlbar;
        },
        
        //insert the control bar and return it to be reused
        prepare_controlbar: function(element,controlbarid, checkplayer,resourceplayer, mediatype){
                var ip = this.fetch_instanceprops(controlbarid);
                var skin_style = ip.config.media_skin_style;
                
                var recorder_class = mediatype=='video' ?  'poodll_mediarecorder_video' : 'poodll_mediarecorder_audio';

                //load resource player with the src of the resource audio (or video ...never)
                resourceplayer = resourceplayer.replace('@@RESOURCEURL@@', ip.config.resource);

                var size_class = 'poodll_mediarecorder_size_auto';
                switch(ip.config.size){
                	case 'small':
	                	size_class = 'poodll_mediarecorder_size_small';
                		break;
                	case 'big':
                		size_class = 'poodll_mediarecorder_size_big';
                		break;
                	case 'auto':
	                	size_class = 'poodll_mediarecorder_size_auto';		
                }

				var ss = this.pmr.fetch_strings();
                var controls ='<div class="poodll_mediarecorderholder_split '
                	+ recorder_class + ' ' + size_class + '" id="holder_' + controlbarid + '">' ;
                	
                controls +='<div class="poodll_mediarecorderbox_split" id="' + controlbarid + '">' ;
                controls +='<div class="style-holder ' + skin_style + '">' ;

                controls += checkplayer,
                controls += resourceplayer,
                
				
                controls +=  '<button type="button" class="poodll_mediarecorder_button_split poodll_play-resource_split">'
                    + '<span class="fa fa-play-circle fa-4x"></span>'
                    + '</button>';

                //this is never displayed
                controls +=  '<button type="button" class="poodll_mediarecorder_button_split poodll_start-recording_split">'
 				+ '<span class="fa fa-microphone fa-4x"></span>' 
                +  '</button>';

                //this is never displayed
                controls += ' <button type="button" class="poodll_mediarecorder_button_split poodll_playback-recording_split hide">'
                + '<span class="fa fa-play-circle fa-4x"></span>' 
				+ '</button>';

                //this is never displayed
                controls += ' <button type="button" class="poodll_mediarecorder_button_split poodll_stopplayback-recording_split hide">'
                + '<span class="fa fa-stop-circle fa-4x"></span>' 
				+ '</button>';

                //Status
                var status = this.fetch_status_bar('split');
                controls += status;



                //completioncheck /*On hold for now Justin 20171007 */
               // This is never displayed
				controls += '<div class="marker hide"><i class="fa fa-check" aria-hidden="true"></i></div>';
                controls += '</div></div></div>';
                $(element).prepend(controls);


                //stop recording and save buttons, are after question text (save does not really need to be)
                 var splitcontrols ="";
                splitcontrols += '<div class="poodll_mediarecorderholder_split"><button type="button" class="poodll_mediarecorder_button_split poodll_stop-recording_split pmr_disabled" disabled>'
                    + '<span class="fa fa-stop-circle fa-4x"></span>'
                    + '</button></div>';
                //this is never displayed
                splitcontrols += '<button type="button" class="poodll_save-recording_split pmr_disabled hide">' + ss['recui_save'] +  '</button></div>';
                $('.qtext').append(splitcontrols);


                var controlbar ={
					marker:  $('#' + controlbarid + '  .marker'),
                    status: $('#' + controlbarid + '  .poodll_status_split'),
                    resourceplayer: $('#' + controlbarid + '  .poodll_resourceplayer_split'),
                    checkplayer: $('#' + controlbarid + '  .poodll_checkplayer_split'),
                    resourceplaybutton: $('#' + controlbarid + '  .poodll_play-resource_split'),
                    resourcestopbutton: $('#' + controlbarid + '  .poodll_stop-resource_split'),
                    startbutton: $('#' + controlbarid + '  .poodll_start-recording_split'),
                    playbackbutton: $('#' + controlbarid + '  .poodll_playback-recording_split'),
                    stopplaybackbutton: $('#' + controlbarid + '  .poodll_stopplayback-recording_split'),
                    /*On hold for now Justin 20171007 */
                    //completioncheck: $('#' + controlbarid + '  .poodll_mediarecorder_completion_split'),

                    //these are outside the control bar in the split recorder
                    savebutton: $('.poodll_save-recording_split'),
                    stopbutton: $('.poodll_mediarecorder_button_split.poodll_stop-recording_split')
                };
                return controlbar;
        }, //end of fetch_control_bar_split


        register_controlbar_events_video: function(onMediaSuccess, controlbarid) {
            return this.register_controlbar_events_audio(onMediaSuccess,  controlbarid);
        },

        do_callback: function(args){
            //log.debug(args);
            //args will look like this
            /*
            0:"recorderbase5a367e03c2f9319"
            1:"filesubmitted"
            2:"poodllfile5a367e03c2f9318.mp3"
            3:"q101:1_answer_id"
            */
            switch(args[1]){

                case 'filesubmitted':
                    //record the url on the html page,
                    var filenamecontrol = document.getElementById(args[3]);
                    if(filenamecontrol==null){ filenamecontrol = parent.document.getElementById(args[3]);}
                    if(filenamecontrol){
                        filenamecontrol.value = args[2];
                    }

                    //go next
                    var f = document.getElementById("responseform");
                    if (typeof f != 'undefined') {
                        if (typeof f.next != 'undefined'){
                            f.next.click();
                        }
                    }
            }
        },

        register_controlbar_events_audio: function(onMediaSuccess, controlbarid){

            var self = this;
            var pmr=this.pmr;
            var ip = this.fetch_instanceprops(controlbarid);

            this.set_visual_mode('neverrecordedmode',ip);
            ip.config.callbackjs= self.do_callback;

			function poodll_resource_play(count_down) {   
				var cd;
                var playingstring = M.util.get_string('recui_playing','filter_poodll');
                self.update_status(controlbarid, playingstring + ip.timer.fetch_display_time(count_down));
				cd = setInterval(function() {
					count_down--;
					if(count_down < 0) {
						clearInterval(cd); 
					} else {
                        self.update_status(controlbarid, playingstring + ip.timer.fetch_display_time(count_down));
					}
				}, 1000);   
			}        

			ip.controlbar.resourceplayer.on('ended', function() {
				ip.controlbar.startbutton.trigger( "click" );
			});
			
			
            ip.controlbar.startbutton.click(function() {

                pmr.do_start_audio(ip, onMediaSuccess);
                self.recorded = true;

                //recording timer setup
                ip.timer.reset();
                ip.timer.start();

                self.set_visual_mode('recordingmode',ip);
				
				
            });
            
            ip.controlbar.stopbutton.click(function() {
				pmr.do_stop_audio(ip);
                self.disable_button(this);

               //click the 'save' button
                //this timeout is ugly but we just need a few ms for the blobs to arrive
                setTimeout(function() {
                    ip.controlbar.savebutton.click();
                },100);


                //recording timer
                ip.timer.stop();
                self.set_visual_mode('allstoppedmode',ip);


            });


            ip.controlbar.resourceplaybutton.click(function(){

                //if we do not have a media file, just start recording
                if (ip.config.resource == '') {
                    ip.controlbar.startbutton.trigger( "click" );
                    return;
                }

                //flag played
                self.played = true;

                //otherwise, and usually, we will have a prompt to play
				var duration = ip.controlbar.resourceplayer.prop('duration');
				poodll_resource_play(Math.round(duration));
				self.do_play_resource(ip);

                //do visuals
                 self.set_visual_mode('resourceplayingmode',ip);

            });
            
             ip.controlbar.resourcestopbutton.click(function(){
				self.do_stop_resource(ip); 
                
               //do visuals
               if(self.recorded){
                  self.set_visual_mode('allstoppedmode',ip);
                }else{
                  self.set_visual_mode('neverrecordedmode',ip);
                }
                
            });

           ip.controlbar.savebutton.click(function() {
              self.disable_button(this);
              if(ip.blobs && ip.blobs.length > 0){
                  pmr.do_save_audio(ip);
                  self.uploaded = true;
                  self.disable_button(ip.controlbar.startbutton);
                }else{
                    ip.uploader.Output(M.util.get_string('recui_nothingtosaveerror','filter_poodll'));
                }//end of if self.blobs		
                //probably not necessary  ... but getting odd ajax errors occasionally
                return false;
            });//end of save recording
            
            window.onbeforeunload = function() {
                self.enable_button(ip.controlbar.startbutton);
                var checkplayer = ip.controlbar.checkplayer;
                if(checkplayer && checkplayer.get(0)){
                    checkplayer.get(0).pause();
                }
            };           
            
        }, //end of register_control_bar_events_split
        

        set_completion: function(completed,ip){
            /*On hold for now Justin 20171007 */
            return;

            var completioncheck = ip.controlbar.completioncheck;
            if(completed){
                completioncheck.removeClass('fa-circle');
                completioncheck.addClass('fa-check-circle');
            }else{
                completioncheck.removeClass('fa-check-circle');
                completioncheck.addClass('fa-circle');
            }
        },

        //DO stop playing the resource
        do_stop_resource: function(ip){
        	console.log('stopped the resource');
        	var resourceplayer = ip.controlbar.resourceplayer.get(0);
            resourceplayer.pause();
            resourceplayer.currentTime=0;
            
             if(ip.mustResetResourcePlayer){
                ip.mustResetResourcePlayer = false;
                resourceplayer.src=ip.config.resource;                
                var ppromise = resourceplayer.load(); 
                /* 
				// playPromise won’t be defined.
				if (ppromise !== undefined) {
					ppromise.then(function() {resourceplayer.pause();});
				}else{
					resourceplayer.oncanplay(resourceplayer.pause());
				}
				*/
			}
		},
        
        
        //do the play of resource
        do_play_resource: function(ip){
        	//if was used to play recording, we need to reset it
                var resourceplayer = ip.controlbar.resourceplayer.get(0);
                resourceplayer.play();
                resourceplayer.currentTime = 0;
        },

        enable_button: function(button){
            $(button).attr('disabled',false);
            $(button).removeClass('pmr_disabled');
        },
        disable_button: function(button){
            $(button).attr('disabled',true);
            $(button).addClass('pmr_disabled');
        },

    };//end of returned object

	
});//total end