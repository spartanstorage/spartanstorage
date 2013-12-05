var filename=null;

$("table tbody tr").click(function() {
      $(this).siblings().removeClass("highlight");
      $(this).addClass("highlight");
      filename = $(this).attr('id');
});


$("#downloadBtn").click(function() {
    if (filename !== null) {    
        //$.get( "/download?key="+filename, function( data ) {
        //      alert( "Load was performed." );
        //      });
        $.fileDownload('/download?key='+encodeURIComponent(filename))
        .done(function () { /*alert('File download a success!');*/ })
        .fail(function () { alert('File download failed!'); });
    }
});

$("#deleteBtn").click(function() {
    if (filename !== null) {
        $.ajax({    
           url: '/delete?key='+encodeURIComponent(filename),
           type: 'DELETE',
           success: function() {
               window.location.reload(true);
           }
       })
    }
});