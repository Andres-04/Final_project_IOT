var address = "https://192.168.42.1:1880/admin/";
var tab = "";
var map;
var maxvalor = 0;
var minvalor = 1000;
var heatmap;

function initHeatMap(heatmapData) {

    if (heatmapData.length) {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            radius: 30
        });
        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
    }


}

function initMap() {

    var bogota = new google.maps.LatLng(4.645356, -74.079849);

    map = new google.maps.Map(document.getElementById('map'), {
        center: bogota,
        zoom: 12,
        mapTypeId: 'roadmap'
    });
}

function testMap() {
    var hmap = [
        { location: new google.maps.LatLng(4.662185, -74.070067), weight: 0.6 },
        { location: new google.maps.LatLng(4.659826, -74.061877), weight: 0.3 },
        { location: new google.maps.LatLng(4.665626, -74.098165), weight: 0.2333 },
        { location: new google.maps.LatLng(4.647559, -74.095559), weight: 0.5 }
    ];

    initHeatMap(hmap)
}
// al estar lista la página
$(document).ready(function() {

    maxvalor = 0;
    minvalor = 10000000;

    tab = $("#table").DataTable({
        deferRender: true,
        scrollCollapse: true,
        searching: false,
        paging: false,
        order: [
            [0, "desc"]
        ]
    });
    updateAjax();


});

function updateAjax() {

    $.ajax({
        url: address + 'getAll',
        success: function(res) {
            console.log(res);
            var obj = res;

            // Refresh Table
            tab.clear();

            var average = 0;
            var hmap = [];

            if (Array.isArray(res) && res.length) {


                for (var r in obj) {
                    var thisvalor = obj[r]['valor'];
                    average += thisvalor;
                    var lat = obj[r]['lat'];
                    var long = obj[r]['long'];
                    var time = moment(obj[r]['hora']).add(3, 'hours').format('YYYY-MM-DD HH:mm:ss', '');

                    tab.row.add([
                        time, lat, long, thisvalor
                    ]).draw(false);

                    var addGrade = { location: new google.maps.LatLng(lat, long), weight: thisvalor };
                    hmap.push(addGrade);

                    setvalor(thisvalor);

                    if (thisvalor > maxvalor) {
                        maxvalor = thisvalor;
                        setMax(thisvalor);
                    }

                    if (thisvalor < minvalor) {
                        minvalor = thisvalor;
                        setMin(thisvalor);
                    }
                }
                average = average / obj.length
                setaverage(average);
            } else {
                tab.draw(false);
                setMax(-1);
                setMin(-1);
                setaverage(-1);
                setvalor(-1);
            }


            initHeatMap(hmap);

            // Llamado recursivo
            // setTimeout(updateAjax(), 500)
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });


}
// funcion para eliminar los registros 
function reset() {
    $.ajax({
        url: address + 'reset',
        success: function(res) {
            updateAjax();
        }
    });

    maxvalor = 0;
    minvalor = 10000000;

}


// set de valoreratura
function setvalor(t) {
    if (t >= 0)
        $("#temperature").html(+parseFloat((t).toFixed(3)))
    else
        $("#temperature").html("...");
    console.log(t);
}

// set de average
function setaverage(t) {
    if (t >= 0)
        $("#average").html(+parseFloat((t).toFixed(3)))
    else
        $("#average").html("...");
    console.log(t);
}

// set de valoreratura maxima
function setMax(t) {
    if (t >= 0)
        $("#maximum").html(+parseFloat((t).toFixed(3)))
    else
        $("#maximum").html("...");
    console.log(t);
}

// set de valoreratura minima
function setMin(t) {
    if (t >= 0)
        $("#minimum").html(+parseFloat((t).toFixed(3)))
    else
        $("#minimum").html("...");
    console.log(t);
}



//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var rec; //Recorder.js object
var input; //MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
    console.log("recordButton clicked");

    wipeForm();

    /*
    	Simple constraints object, for more advanced audio features see
    	https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    var constraints = { audio: true, video: false }

    /*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false

    /*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
        	create an audio context after getUserMedia is called
        	sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
        	the sampleRate defaults to the one set in your OS for your playback device
        */
        audioContext = new AudioContext();

        //update the format 
        document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

        /*  assign to gumStream for later use  */
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /* 
        	Create the Recorder object and configure to record mono sound (1 channel)
        	Recording 2 channels  will double the file size
        */
        rec = new Recorder(input, { numChannels: 1 })

        //start the recording process
        rec.record()

        console.log("Recording started");
        $('#countdesc').html("Grabando... Espera");
        $('#timer').html('<span id="time">10</span> seg.');

        var counter = 2;
        var interval = setInterval(function() {
            counter--;
            // Display 'counter' wherever you want to display it.
            if (counter <= 0) {
                clearInterval(interval);
                $('#timer').html('<span id="time">-</span> seg.');

                $('#countdesc').html("Haz click en el botón para grabar de nuevo");
                $('#timer').html('---');
                stopRecording();
                return;
            } else {
                $('#time').text(counter);
                console.log("Timer --> " + counter);
            }
        }, 1000);


    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}

function pauseRecording() {
    console.log("pauseButton clicked rec.recording=", rec.recording);
    if (rec.recording) {
        //pause
        rec.stop();
        pauseButton.innerHTML = "Resume";
    } else {
        //resume
        rec.record()
        pauseButton.innerHTML = "Pause";

    }
}

function stopRecording() {
    console.log("stopButton clicked");


    //disable the stop button, enable the record too allow for new recordings
    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;

    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML = "Pause";

    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
}

var x = document.getElementById("demo");
var latinput = $("#lat");
var longinput = $("#long");
var volume = $("#volume");
var worked = false;

var thisBlob;
var filename;

function createDownloadLink(blob) {
    thisBlob = blob;
    filename = new Date().toISOString();
    startUpload();

    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    //name of .wav file to use during upload and download (without extendion)
    //add controls to the <audio> element
    au.controls = true;
    au.src = url;
    au.style = "width: 100%";

    var demo = $("#demo");
    //add the new audio element to li
    demo.append(au);

    //add the filename to the li
    // demo.append(document.createTextNode(filename + ".wav "))

}

function activateLoader() {
    $('#analysisForm').waitMe({
        effect: 'bounce',
        text: 'Subiendo y analizando audio...',
        bg: 'rgba(255,255,255,0.7)',
        color: '#ea4542'
    });
}

function hideLoader() {
    $('#analysisForm').waitMe("hide");
}


function uploadRecording() {

    activateLoader();
    var xhr = new XMLHttpRequest();
    xhr.onload = function(e) {
        if (this.readyState === 4) {
            $("#waveimage").attr("src", "/recordings/" + filename + ".png");
            volume.val(+parseFloat((parseFloat(e.target.responseText.trim())).toFixed(8)))

            console.log("Server returned: ", e.target.responseText);


            $("#mapPick").addClass("mapsize");
            $("#demo").removeClass("hidden");
            hideLoader();
        }
    };
    var fd = new FormData();
    fd.append("audio_data", thisBlob, filename);

    xhr.open("POST", "admin/analyze", true);
    xhr.send(fd);
}

$("#analysisForm").submit(function(e) {

    //prevent Default functionality
    e.preventDefault();

    uploadData()

});

function wipeForm() {
    $("#waveimage").attr("src", "");
    volume.val("");
    longinput.val("");
    latinput.val("");
    $("#demo").html("");
    $("#demo").addClass("hidden");
}

function uploadData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(e) {
        if (this.readyState === 4) {
            wipeForm();
            $('#exampleModal').modal('hide')
            updateAjax();
        }
    };
    var fd = new FormData();
    fd.append('volume', volume.val());
    fd.append('lat', latinput.val());
    fd.append('long', longinput.val());

    console.log($("#volume").val());
    console.log($("#lat").val());
    console.log($("#long").val());
    xhr.open("POST", "admin/upload", true);
    xhr.send(fd);
}

function startUpload() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
    } else {
        "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    latinput.val(+parseFloat((position.coords.latitude).toFixed(8)));
    longinput.val(+parseFloat((position.coords.longitude).toFixed(8)));
    initMapPicker(position.coords.latitude, position.coords.longitude)
    uploadRecording();
}


function analyzeAudio() {
    //funcion sencilla para encontrar volumen aleatorio
    return (Math.random() * (5 - 0.12) + 0.12).toFixed(4)
}

function initMapPicker(myLat, myLong) {
    var pos = { lat: myLat, lng: myLong };

    var map = new google.maps.Map(document.getElementById('mapPick'), {
        zoom: 14,
        center: pos
    });

    var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Hello World!'
    });

    infoWindow = new google.maps.InfoWindow;


    google.maps.event.addListener(map, "idle", function() {
        var NewMapCenter = map.getCenter();
        var latitude = +parseFloat((NewMapCenter.lat()).toFixed(8));
        var longitude = +parseFloat((NewMapCenter.lng()).toFixed(8));

        console.log(latitude)
        console.log(longitude)

        latinput.val(latitude)
        longinput.val(longitude)

        marker.setPosition(NewMapCenter);
    });




}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}