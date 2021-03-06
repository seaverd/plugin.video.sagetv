/*
* Name: xbmc.js
* Author: lehighbri
*
**********************/
var XBMCJS_VERSION_NUMBER = '1.4.2';

function GetXBMCJSVersionNumber() {
   return XBMCJS_VERSION_NUMBER;
}

function GetTVMediaFilesWithSubsetOfProperties() {
   var shows = new java.util.ArrayList();
   var files =  MediaFileAPI.GetMediaFiles("T");
   files = Database.Sort(files,true,"GetAiringStartTime")
   var s = files.length;
   for (var i=0;i<s;i++) {
      var mf = files[i];
      var show = java.util.HashMap();
      show.put('MediaFileID', ""+MediaFileAPI.GetMediaFileID(mf));
      show.put('ShowTitle', MediaFileAPI.GetMediaTitle(mf));
      show.put('ShowExternalID', ShowAPI.GetShowExternalID(mf));
      show.put('AiringStartTime', AiringAPI.GetAiringStartTime(mf));
      show.put('ShowGenre', ShowAPI.GetShowCategoriesString(mf));
      shows.add(show);
   }
   return shows;
}

function GetMediaFilesForShowWithSubsetOfProperties(showtitle) {
   var shows = new java.util.ArrayList();
   var files;
   if(showtitle == "") {
      files = MediaFileAPI.GetMediaFiles("T");
   }
   else {
      files = Database.FilterByMethod(MediaFileAPI.GetMediaFiles("T"), "GetMediaTitle", showtitle, true);
   }
   var s = files.length;
   for (var i=0;i<s;i++) {
      var mf = files[i];
      var show = java.util.HashMap();
      show.put('MediaFileID', ""+MediaFileAPI.GetMediaFileID(mf));
      if(showtitle == "") {
         show.put('ShowTitle', ShowAPI.GetShowTitle(mf));
      }
      else {
         show.put('ShowTitle', showtitle);
      }
      show.put('ShowExternalID', ShowAPI.GetShowExternalID(mf));
      show.put('EpisodeTitle', ShowAPI.GetShowEpisode(mf));
      show.put('EpisodeDescription', ShowAPI.GetShowDescription(mf));
      show.put('ShowGenre', ShowAPI.GetShowCategoriesString(mf));
      show.put('AiringID', ""+AiringAPI.GetAiringID(mf));
      show.put('SeasonNumber', ShowAPI.GetShowSeasonNumber(mf));
      show.put('EpisodeNumber', ShowAPI.GetShowEpisodeNumber(mf));
      show.put('AiringChannelName', AiringAPI.GetAiringChannelName(mf));
      show.put('IsFavorite', AiringAPI.IsFavorite(mf));
      show.put('AiringStartTime', AiringAPI.GetAiringStartTime(mf));
      show.put('OriginalAiringDate', ShowAPI.GetOriginalAiringDate(mf));
      show.put('SegmentFiles', MediaFileAPI.GetSegmentFiles(mf));
      show.put('WatchedDuration', AiringAPI.GetWatchedDuration(mf));
      show.put('IsWatched', AiringAPI.IsWatched(mf));
      show.put('FileDuration', MediaFileAPI.GetFileDuration(mf));
      show.put('IsLibraryFile', MediaFileAPI.IsLibraryFile(mf));
      shows.add(show);
   }
   return shows;
}

function SearchForMediaFiles(searchterm) {
   var shows = new java.util.ArrayList();
   //searchresults will be a vector, not an arraylist like in the functions above
   var searchresults = Database.FilterByMethod(Database.SearchSelectedFields(searchterm,false,true,true,false,false,false,false,false,false,false,"T"), "GetMediaFileForAiring", null, false);
   var s = searchresults.size();
   for (var i=0;i<s;i++) {
      var airing = searchresults.get(i);
      var show = java.util.HashMap();
      var airingID = AiringAPI.GetAiringID(airing);
      if (airingID != 0){
          mf = AiringAPI.GetMediaFileForAiring(AiringAPI.GetAiringForID(airingID));
          show.put('MediaFileID', ""+MediaFileAPI.GetMediaFileID(mf));
          show.put('AiringID', ""+airingID);
          show.put('ShowTitle', ShowAPI.GetShowTitle(mf));
          show.put('ShowExternalID', ShowAPI.GetShowExternalID(mf));
          show.put('EpisodeTitle', ShowAPI.GetShowEpisode(mf));
          show.put('EpisodeDescription', ShowAPI.GetShowDescription(mf));
          show.put('ShowGenre', ShowAPI.GetShowCategoriesString(mf));
          show.put('SeasonNumber', ShowAPI.GetShowSeasonNumber(mf));
          show.put('EpisodeNumber', ShowAPI.GetShowEpisodeNumber(mf));
          show.put('AiringChannelName', AiringAPI.GetAiringChannelName(mf));
          show.put('IsFavorite', AiringAPI.IsFavorite(mf));
          show.put('AiringStartTime', AiringAPI.GetAiringStartTime(mf));
          show.put('OriginalAiringDate', ShowAPI.GetOriginalAiringDate(mf));
          show.put('SegmentFiles', MediaFileAPI.GetSegmentFiles(mf));
          show.put('WatchedDuration', AiringAPI.GetWatchedDuration(mf));
          show.put('IsWatched', AiringAPI.IsWatched(mf));
          show.put('FileDuration', MediaFileAPI.GetFileDuration(mf));
          show.put('IsLibraryFile', MediaFileAPI.IsLibraryFile(mf));
          shows.add(show);
      }
   }
   return shows;
}

function GetTVMediaFilesGroupedByTitle() {
   var grouped = new java.util.HashMap();
   var files = GetTVMediaFilesWithSubsetOfProperties();
   var s = files.size();
   for (var i=0;i<s;i++) {
      var file = files.get(i);
      var showTitle = file.get('ShowTitle')
      var shows = grouped.get(showTitle);
      if (shows==null) {
         shows = new java.util.ArrayList();
         grouped.put(showTitle, shows);
         var totalEpisodes = GetTotalNumberOfEpisodesForShow(showTitle);
         var watchedEpisodes = GetTotalNumberOfWatchedEpisodesForShow(showTitle);
         file.put("TotalEpisodes",totalEpisodes);
         file.put("TotalWatchedEpisodes",watchedEpisodes);
         shows.add(file);
      }
   }
   return grouped;
}
function GetPlaylistOfSegmentsForMediafile(mediafileID,sage_rec,sage_unc) {
    var mf = MediaFileAPI.GetMediaFileForID(mediafileID);
    if (mf == "" || sage_rec == "" || sage_unc == "") return "";
    var segs = MediaFileAPI.GetSegmentFiles(mf);
    ret = "#EXTM3U\n";
    for (var i=0;i<segs.length;i++) {
        ret = ret + segs[i].getAbsolutePath().replace(sage_rec,sage_unc) + "\n";
    }
    return ret;
}

function GetFavoriteIDForShowTitle(showtitle) {
   var favs =  FavoriteAPI.GetFavorites();
   favoriteID = "";
   var s = favs.length;
   for (var i=0;i<s;i++) {
      var fav = favs[i];
      if(showtitle == FavoriteAPI.GetFavoriteTitle(fav)) {
        favoriteID = ""+FavoriteAPI.GetFavoriteID(fav);
        break;
      }
   }
   return favoriteID;
}

function GetPluginVersion(pluginidentifier) {
   var PluginAPI = Packages.sagex.api.PluginAPI;
   var plugins =  PluginAPI.GetInstalledPlugins();
   pluginVersion = "";
   var s = plugins.length;
   for (var i=0;i<s;i++) {
      var plugin = plugins[i];
      if(pluginidentifier == PluginAPI.GetPluginIdentifier(plugin)) {
        pluginVersion = PluginAPI.GetPluginVersion(plugin);
        break;
      }
   }
   return pluginVersion;
}

function GetTotalNumberOfEpisodesForShow(showtitle) {
   var files;
   if(showtitle == "") {
      files = MediaFileAPI.GetMediaFiles("T");
   }
   else {
      files = Database.FilterByMethod(MediaFileAPI.GetMediaFiles("T"), "GetMediaTitle", showtitle, true);
   }
   return files.length;
}

function GetTotalNumberOfWatchedEpisodesForShow(showtitle) {
   var files;
   if(showtitle == "") {
      files = MediaFileAPI.GetMediaFiles("T");
   }
   else {
      files = Database.FilterByMethod(MediaFileAPI.GetMediaFiles("T"), "GetMediaTitle", showtitle, true);
   }
   files = Database.FilterByBoolMethod(files, "IsWatched", true);
   return files.length;
}
