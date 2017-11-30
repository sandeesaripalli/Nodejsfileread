var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var instream = fs.createReadStream('yesware-test-data-v1-7.txt');
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

var fd = fs.openSync('output.txt', 'w');

var names = [];

rl.on('line', function (line) {
    var nameDelimiter = line.indexOf('--');

    if(nameDelimiter > 0) {
        var probableName = line.substr(0, nameDelimiter-1),
            validNameDelimiter = probableName.indexOf(','),
            lastName = probableName.split(',')[0],
            firstName = probableName.split(',')[1].trim();

        if(validNameDelimiter > 0 && /^[a-zA-Z]+$/.test(lastName) && /^[a-zA-Z]+$/.test(firstName)) {
            names.push({ln: lastName, fn: firstName});
        }
    }
});

rl.on('close', function() {
  fs.write(fd,"The unique count of full names : " + uniqueCount(names, 'ln', 'fn') + "\n");
  fs.write(fd,"The unique count of last names : " + uniqueCount(names, 'ln') + "\n");
  fs.write(fd,"The unique count of first names : " + uniqueCount(names, null, 'fn') + "\n");
  fs.write(fd,"The common last names : \n");
  commonNames(names, 'ln', 10)
  fs.write(fd,"The common first names : \n");
  commonNames(names, 'fn', 10)
  fs.write(fd,"The unique complete names : \n");
  printNames(uniqueCompleteNames(names , 25));
  fs.write(fd,"The modified complete names : \n");
  printNames(modifiedNames(uniqueCompleteNames(names , 25)));

});

function uniqueCount(names, lastName, firstName) {
    var uniqueNames = names.filter(function (name) {
        var key;
        if(lastName && firstName) key = name[lastName] + '|' + name[firstName];
        else if (lastName) key = name[lastName];
        else if (firstName) key = name[firstName];

        if (!this[key]) {
            this[key] = true;
            return true;
        }
    }, Object.create(null));

  return uniqueNames.length;
}

function commonNames(names, namePart, topN) {
    var commonNames = { },
        finalOutput = [];
    for(var i = 0; i < names.length; i++) {
        commonNames[names[i][namePart]] = (commonNames[names[i][namePart]] || 0) + 1;
    }
    for(var name in commonNames) {
        finalOutput.push({name: name, count: commonNames[name]})
    }
    function compare(a,b) {
        if (a.count > b.count)
            return -1;
        if (a.count < b.count)
            return 1;
        return 0;
    }

    finalOutput.sort(compare);

    topN = (finalOutput.length <= topN) ? finalOutput.length : topN;

    for(var i=0; i<topN; i++) {
        fs.write(fd,(namePart === 'ln' ? 'LastName' : 'FirstName') + " : " + finalOutput[i].name + " -> number of occurrences : " + finalOutput[i].count  + "\n");
    }
}

function uniqueCompleteNames(names, N) {
    if(N <= names.length) names = names.slice(0,N);
    var completeName = {},
    uniqueCompleteNames = names.filter(function (name) {
        if (!completeName[name.ln] && !completeName[name.fn]) {
            completeName[name.ln] = true;
            completeName[name.fn] = true;
            return true;
        }
    }, Object.create(null));

    return uniqueCompleteNames;
}

function modifiedNames(names) {
    var tempFn = names[0].fn;
    for(var i=0; i<names.length-1; i++) {
        names[i].fn = names[i+1].fn;
    }
    names[names.length-1].fn = tempFn;
    return names;
}

function printNames(names) {
    for(var i=0; i<names.length; i++) {
        fs.write(fd,"Name : " + names[i].ln + " " + names[i].fn  + "\n");
    }
}