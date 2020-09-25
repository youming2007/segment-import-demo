'use strict';

segImport.controller('mainController', ['$scope', '$http',
  function($scope, $http)
{
  var csv = $scope.csv = {};

  csv.array = []; // These are the rows.
  csv.JSON = []; // JSON object
  csv.finalJSON = {};
  csv.JSONString = '';
  csv.writeKey = '';

  // Take csv string and turn it into array.
  csv.addArray = function addArray(csv) {
    csv.forEach(function(row) {
      this.array.push(row);
    }.bind(this));
    this.arrayToJSON();
  };

  // Empty rows in csv.array.
  csv.removeAll = function removeAll() {
    this.array.length = 0;
  };

  // Convert csv.array to csv.JSON.
  csv.arrayToJSON = function arrayToJSON() {

    var headers = this.array[0];
    this.JSON.length = 0;

    var dataMappingKey = [
      'Code_client_ou_identifiant_client', // 0
      'Centre_de_cout', // 1
      'Prénom', // 2
      'Nom', // 3
      'Titre', // 5
      'Code_Postal', // 9
      'Pays',
      'Téléphone',
      'E-mail',
      'Date_de_création_compte_VEL',
      'Date_de_création_compte_jeff_club',
      'Date_de_dernière_connexion_VEL',
      'Date_de_dernière_connexion_jeff_club',
      'inscription_newsletter_VEL',
      'inscription_newsletter_jeff_club',
      'Date_de_naissance',
      'Code_client_du_magasin_préféré_pour_les_clients_Jeff_club'
    ];

    var importColumnIndexMapping = [];
    for (var i = 0; i < dataMappingKey.length; i++) {
      var index = headers.indexOf(dataMappingKey[i]);
      importColumnIndexMapping.push(index);
    }

    for (var i = 1; i < this.array.length; i++) {
      var obj = {};
      var currentLine = this.array[i];
      for (var j = 0; j < headers.length; j++) {
        var index = importColumnIndexMapping.indexOf(j);
        if (index == -1) {
          continue;
        }
        
        obj["type"] = "identify";

        if (!obj["traits"]) {
          obj["traits"] = {};
        }
            
        // Add currentLine value
        if (index == 0) {
          obj["userId"] = "S" + currentLine[j];
        } else if (index == 1) {
          if (currentLine[j].indexOf("JC") > -1) {
            obj["traits"]["jeffclub"] = 1;
          } else {
            obj["traits"]["jeffclub"] = 0;
          }
          if (currentLine[j].indexOf("VEL") > -1) {
            obj["traits"]["vel_customer"] = 1;
          }
        } else if (index == 2) {
          obj["traits"]["first_name"] = currentLine[j];
        } else if (index == 3) {
          obj["traits"]["last_name"] = currentLine[j];
        } else if (index == 4) {
          if (currentLine[j] == "mr") {
            obj["traits"]["gender"] = "m";
          } else if (currentLine[j] == "mm" || currentLine[j] == "ms" ) {
            obj["traits"]["gender"] = "mme";
          }
        } else if (index == 5) {
          obj["traits"]["postal_code"] = currentLine[j];
        } else if (index == 6) {
          obj["traits"]["country"] = currentLine[j];
        } else if (index == 7) {
          if (currentLine[j].startsWith("06") || currentLine[j].startsWith("07") || currentLine[j].startsWith("+336") || currentLine[j].startsWith("+337") || currentLine[j].startsWith("00336") || currentLine[j].startsWith("00337")) {
            obj["traits"]["mobile_phone"] = currentLine[j];
          } else {
            obj["traits"]["phone"] = currentLine[j];
          }
        } else if (index == 8) {
          obj["traits"]["email"] = currentLine[j];
        } else if (index == 9) {
          var jeffclub_date = currentLine[importColumnIndexMapping[index + 1]];
          if (currentLine[j] == "") {
            obj["traits"]["created_at"] = jeffclub_date;
            obj["traits"]["updated_at"] = jeffclub_date;
          } else if (jeffclub_date == "") {
            obj["traits"]["created_at"] = currentLine[j];
            obj["traits"]["updated_at"] = currentLine[j];
          } else if (currentLine[j] > jeffclub_date) {
            obj["traits"]["created_at"] = jeffclub_date;
            obj["traits"]["updated_at"] = jeffclub_date;
          } else {
            obj["traits"]["created_at"] = currentLine[j];
            obj["traits"]["updated_at"] = currentLine[j];
          }
        } else if (index == 10) {
          
        } else if (index == 11) {
          // obj["traits"]["last_connexion_vel"] = currentLine[j];
        } else if (index == 12) {
          // obj["traits"]["last_connexion_jeffclub"] = currentLine[j];
        } else if (index == 13) {
          obj["traits"]["optin_web_newsletter"] = currentLine[j];
          obj["traits"]["date_optin_web_newsletter"] = currentLine[importColumnIndexMapping[9]];
        } else if (index == 14) {
          obj["traits"]["optin_jeffclub_newsletter"] = currentLine[j];
          obj["traits"]["date_optin_jeffclub_newsletter"] = currentLine[importColumnIndexMapping[10]];
        }  else if (index == 15) {
          obj["traits"]["birthday"] = currentLine[j];
        }  else if (index == 16) {
          obj["traits"]["prefered_store_code"] = currentLine[j];
        }
        obj["traits"]["proximis_account_activated"] = 0;
        // if (headers[j].indexOf('.') > 0) {
        //   var prefix = headers[j].substring(0, headers[j].indexOf('.'));
        //   var suffix = headers[j].substring(headers[j].indexOf('.') + 1);
        //   if (!obj[prefix])
        //     obj[prefix] = {};
        //   obj[prefix][suffix] = currentLine[j];
        // } else {
        //   obj[headers[j]] = currentLine[j];
        // }
      }
      this.JSON.push(obj);
      
    }
    this.finalJSON["batch"] = this.JSON;
    this.JSONString = JSON.stringify(this.finalJSON, null, 2);
  };

  // Post csv.JSON to end point.
  csv.importJSON = function importJSON() {
    console.log(this.JSON);
    $http.post('/api/import', {batch: this.JSON, writeKey: this.writeKey})
    .success(function(err, data) {
      console.log(err);
      console.log(data);
    })
    .error(function(err, data) {
      console.log(err);
      console.log(data);
    });
  };
}]);