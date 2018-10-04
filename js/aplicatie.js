// This is a JavaScript file
var map;
var centru;
var interval;
var membri = [];

document.addEventListener('show', function (event) {
   var page = event.target;
   ons.ready(function () {
      console.log("Onsen UI is ready!");
      if (page.matches('#tab1')) {
         navigator.geolocation.getCurrentPosition(succes, eroare);

         function succes(position) {
            centru = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
            };

            //  Afisez harta
            map = new google.maps.Map(document.getElementById('map'), { center: centru, zoom: 15 });
            //  Adaug markeri (daca sirul membri contine elemente)
            console.log("membri.length: " + membri.length);
            for (var i = 0; i < membri.length; i++) {
               //  Creez markerele
               var mark = new google.maps.Marker({
                  position: membri[i].position,
                  map: map,
                  label: membri[i].label
               });
            }
            ;
         }

         function eroare(error) { }

      } else if (page.matches('#tab2')) {
         // Preiau informatia din memoria locala
         var memoap = JSON.parse(localStorage.getItem('memoap'));
         if (memoap !== null) {
            var codact = memoap.codact;
            if (codact) {
               var imagine = document.querySelector('#qrcode1');
               imagine.innerHTML = ""; //  Golesc blocul #qrcode1
               //  Desenez codul in blocul #qrcode1
               new QRCode(imagine, {
                  text: codact,
                  width: 200,
                  height: 200,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
               });
            }
         }

         document.querySelector("#scan").onclick = function () {
            window.plugins.barcodeScanner.scan(function (result) {
               var imagine = document.querySelector('#qrcode1');
               imagine.innerHTML = ""; //  Golesc blocul #qrcode1
               new QRCode(imagine, {
                  text: result.text,
                  width: 200,
                  height: 200,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
               });
               //  Memorez codul in memoria locala (browser)
               var memoap = { codact: result.text };
               localStorage.setItem("memoap", JSON.stringify(memoap)); //  memoap in notatie JSON
            }, function (error) {
               alert("Scanning failed: " + error);
            }
            );
         };

         document.querySelector("#adauga").onclick = function () {
            var formData = new FormData();
            var idp = document.querySelector("#idpart").value;
            // Preiau obiectul din memoria locala
            var memoap = JSON.parse(localStorage.getItem('memoap'));
            var codact = memoap.codact;
            //  Formez un nou obiect memoap si il memorez pt. a contine si idpart
            memoap = { "codact": codact, "idpart": idp };
            localStorage.setItem("memoap", JSON.stringify(memoap));
            formData.append('cod', codact);
            formData.append('idpart', idp);
            formData.append('lat', centru.lat);  //  centru e variabila din tab1.html
            formData.append('lng', centru.lng);
            var request = new XMLHttpRequest();
            request.open("POST", "http://aplimob.net/proiect/adpart.php");

            // S-au primit date de la scriptul de pe server
            request.onload = function () {
               incarcMembri(JSON.parse(this.responseText));
               ons.notification.alert('Participat inregistrat cu succes.'); //  Alert inregistrat
               //  Initiez trimiterea periodică a coordonatelor proprii
               interval = setInterval(transmit, 30000);  //  30000 ms = 30s
            };

            // S-a produs o eroare
            request.onerror = function () {
               alert('Hopa! Ceva n-a mers!');
            };

            request.send(formData);
         };

         function incarcMembri(sirObj) {
            //  Adaug in membri
            membri = []; //  Gotesc sirul
            sirObj.forEach(function (item) {
               membri.push(
                  {
                     position: {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lng)
                     },
                     label: item.idpart
                  });
            });
         }

         function transmit() {
            // navigator.geolocation.getCurrentPosition(succes, eroare);
            var req = new XMLHttpRequest();
            req.open("POST", "http://aplimob.net/proiect/adpart.php"); //  pot folosi acelasi script!
            navigator.geolocation.getCurrentPosition(csucces, ceroare);  //  Am nevoie de noile coordonate
            // S-au primit date de la scriptul de pe server
            req.onload = function () {
               incarcMembri(JSON.parse(this.responseText));
            };

            // S-a produs o eroare
            req.onerror = function () {
               alert('Hopa! Ceva n-a mers!');
            };

            function csucces(position) {
               // Preiau obiectul din memoria locala
               var memoap = JSON.parse(localStorage.getItem('memoap'));
               var codact = memoap.codact;
               var idp = memoap.idpart;
               //  Creez un obiect din clasa FormData
               var formData = new FormData();
               formData.append('cod', codact);
               formData.append('idpart', idp);
               formData.append('lat', position.coords.latitude);
               formData.append('lng', position.coords.longitude);
               req.send(formData);
            }
            function ceroare(error) { }
         }
      } else if (page.matches('#tab3')) {
         // Preiau obiectul din memoria locala (daca exista)
         var memoap = JSON.parse(localStorage.getItem('memoap'));
         if (memoap != null) {
            var codact = memoap.codact;
            if (codact) {
               var imagine = document.querySelector('#qrcode2');
               imagine.innerHTML = ""; //  Golesc blocul #qrcode2
               //  Desenez codul din localStorage in blocul #qrcode2
               new QRCode(imagine, {
                  text: codact,
                  width: 200,
                  height: 200,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
               });
            }
         }

         //  Declarare activitate noua
         document.querySelector("#decl").onclick = function () {
            //  AJAX: Apelez scriptul "adactiv.php"
            var request = new XMLHttpRequest();
            var formData = new FormData();
            formData.append('uid', device.uuid);
            request.open("POST", "http://aplimob.net/proiect/adactiv.php");

            // S-au primit date de la scriptul de pe server
            request.onload = function () {
               var imagine = document.querySelector('#qrcode2');
               imagine.innerHTML = "";  //  Golesc blocul #qrcode2
               var obj = JSON.parse(this.responseText);
               //  ons.notification.alert('Cod ' + obj.codact);
               //  Desenez noul cod QR in blocul #qrcode2
               new QRCode(imagine, {
                  text: obj.codact,
                  width: 200,
                  height: 200,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
               });

               //  Memorez in memoria locala (browser) noul codact
               var memoap = { codact: obj.codact };
               localStorage.setItem("memoap", JSON.stringify(memoap));
               //  Alert activitate inregistrata
               ons.notification.alert('Activitate inregistrată cu succes.');
            };

            // S-a produs o eroare
            request.onerror = function () {
               alert('Hopa! Ceva n-a mers!');
            };

            request.send(formData);
         };
      }
   });
});
