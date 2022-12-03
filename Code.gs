var rootFolder = DriveApp.getRootFolder().getId(); // you can change this to whichever folter id you like. As is, it will default to your google drive root folder
var title = "Rephlex Editor";
var parentFolderID;

function doGet(e) {

  var hierarchy;
  
  try {
    var type = e.parameters.type[0];
    var id = e.parameters.id[0];
  } catch(err) {
    var type, id;
  }

  if (type=="folder") {
    rootFolder = id;
    hierarchy = getHierarchy(id);
  } else if (type=="file") {
    title = getName(id);
    hierarchy = getFolderOfFile(id);
    if (!hierarchy) {
      hierarchy = getHierarchy();
    }
  } else {
    hierarchy = getHierarchy();
  }

  var tmp = HtmlService.createTemplateFromFile('index');
  tmp.initType = type;
  tmp.initID = id;
  tmp.hierarchy = hierarchy;
  return tmp
    .evaluate()
    .setTitle(title);    
  
}

function getName(fileID) {
  try {
    var file = DriveApp.getFileById(fileID);
    return file.getName();
  } catch(err) {
    return
  }
}

function open(fileID) {
  try {
    var main = DriveApp.getFileById(fileID);
    var fileObject = {
      text: main.getBlob().getDataAsString(),
      file_id: fileID,
      file_name: main.getName(),
      type: main.getMimeType(),
      access: main.getAccess(Session.getActiveUser())
    }
    return fileObject;
  } catch(err) {
    return
  }
}

function getFolderOfFile(fileID) {
  try {
    var file = DriveApp.getFileById(fileID);
    var hierarchy = getHierarchy(file.getParents().next().getId());
    return hierarchy;
  } catch(err) {
    return
  }
}

function newFolder(mainFolder, folderName) {
  var main = DriveApp.getFolderById(mainFolder);
  var newFolder = main.createFolder(folderName);
  return getHierarchy(mainFolder);
}

function getHierarchy(mainFolder) {
  mainFolder = (!mainFolder) ? rootFolder:mainFolder;
  var main = DriveApp.getFolderById(mainFolder);
  try {
    parentFolderID = main.getParents().next().getId();
  } catch (err) {
    Logger.log(err);
    parentFolderID = main.getId();
  }
  

  var allFolders = main.getFolders();
  var allFiles = main.getFiles();
  var itemList = [];

  var tmpFolArr = [];
  var tmpFilArr = [];

  gtFld();
  gtFil();

  function item(name, id, type) {
    this.name = name;
    this.id = id;
    this.type = type;
  }

  function gtFld() {
    if (allFolders.hasNext()) {
        var nextFolder = allFolders.next();
        var name = nextFolder.getName()
        var id = nextFolder.getId()
        var new_item = new item(name, id, "folder");
        tmpFolArr.push(new_item);
        gtFld();
    }
  }

  tmpFolArr.sort(function(a,b) {
    return (a.name.toLowerCase()<=b.name.toLowerCase()) ? -1: 1;
  });

  function gtFil() {
    if (allFiles.hasNext()) {
        var nextFile = allFiles.next();
        var name = nextFile.getName()
        var id = nextFile.getId()
        var new_item = new item(name, id, "file");
        tmpFilArr.push(new_item);
        gtFil();
    }
  }

  tmpFilArr.sort(function(a,b) {
    return (a.name.toLowerCase()<=b.name.toLowerCase()) ? -1: 1;
  });

  itemList = tmpFolArr.concat(tmpFilArr);

  var hierarchyObj = {
    item_list: itemList,
    parent_folder_id: parentFolderID,
    main_folder: mainFolder,
    folder_name: main.getName()
  }

  return hierarchyObj
}


function saveExistingFile(data, name, type, fileID) {
  var file = DriveApp.getFileById(fileID);
  if (file.getName()==name && file.getMimeType()==type) {
    file.setContent(data);
  } else {
    throw new Error("Could not find specified file ID.")
  }
}

function saveNewFile(data, name, type, folderID) {
  var folder = DriveApp.getFolderById(folderID);
  var existing = folder.getFilesByName(name);
  return checkFiles();

  function checkFiles() {
    var counter = 0;
    var splitName = name.split('.');
    while (existing.hasNext()) {
      counter++ 
      existing = folder.getFilesByName(splitName.join('('+counter+').'));   
    } 
    if (counter>0) {
      var ff = folder.createFile(splitName.join('('+counter+').'),data,type);
    } else {
      var ff = folder.createFile(name,data,type);
    }
    return [open(ff.getId()), getFolderOfFile(ff.getId())]
  }
}


function getFolders() {
  var folder = DriveApp.getFolderById(rootFolder);
  var subFolders = folder.getFolders();
  var folderNames = ["root"];
  var folderIDs = [rootFolder];
  checkFolders();
  
  function checkFolders() {
     if (subFolders.hasNext()) {
        var nextFolder = subFolders.next();
        folderNames.push(nextFolder.getName());
        folderIDs.push(nextFolder.getId());
        checkFolders();
     } 
  }
  
  var folderData = JSON.stringify([folderNames, folderIDs]);
  Logger.log(folderData);
  return folderData
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
