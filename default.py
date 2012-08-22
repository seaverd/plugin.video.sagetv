import urllib,urllib2,re
import xbmc,xbmcplugin,xbmcgui,xbmcaddon
import os
from xml.dom.minidom import parse

__settings__ = xbmcaddon.Addon(id='plugin.video.SageTV')
__language__ = __settings__.getLocalizedString

sage_rec = __settings__.getSetting("sage_rec")
sage_unc = __settings__.getSetting("sage_unc")

def CATEGORIES():
        strUrl = 'http://' + __settings__.getSetting("sage_user") + ':' + __settings__.getSetting("sage_pass") + '@' + __settings__.getSetting("sage_ip") + ':' + __settings__.getSetting("sage_port")
        addDir('All Shows', strUrl + '/sage/Recordings?xml=yes',2,'icon.png')
        #addDir('The Daily Show',strUrl + '/sage/Search?searchType=TVFiles&SearchString=Daily%20show&DVD=on&sort2=airdate_asc&TimeRange=0&pagelen=100&sort1=title_asc&filename=&Video=on&search_fields=title&xml=yes',2,'dailyshow.jpg')
        #addDir('Sports',strUrl + '/sage/Search?searchType=TVFiles&Categories=Sports+event&SearchString=&xml=yes',2,'sports.jpg')

def VIDEOLINKS(url,name):
        #Videolinks gets called immediately after adddir, so the timeline is categories, adddir, and then videolinks
        #Videolinks then calls addlink in a loop
        #This code parses the xml link
        req = urllib.urlopen(url)
        content = parse(req)     
        for showlist in content.getElementsByTagName('show'):
          strTitle = ''
          strEpisode = ''
          strDescription = ''
          strGenre = ''
          strAirdate = ''
          strMediaFileID = ''
          for shownode in showlist.childNodes:
            # Get the title of the show
            if shownode.nodeName == 'title':
              strTitle = shownode.toxml()
              strTitle = strTitle.replace('<title>','')
              strTitle = strTitle.replace('</title>','')
              strTitle = strTitle.replace('&amp;','&')
            # Get the episode name
            if shownode.nodeName == 'episode':
              strEpisode = shownode.toxml()
              strEpisode = strEpisode.replace('<episode>','')
              strEpisode = strEpisode.replace('</episode>','')
              strEpisode = strEpisode.replace('&amp;','&')
            # Get the show description
            if shownode.nodeName == 'description':
              strDescription = shownode.toxml()
              strDescription = strDescription.replace('<description>','')
              strDescription = strDescription.replace('</description>','')
              strDescription = strDescription.replace('&amp;','&')
            # Get the category to use for genre
            if shownode.nodeName == 'category':
              strGenre = shownode.toxml()
              strGenre = strGenre.replace('<category>','')
              strGenre = strGenre.replace('</category>','')
              strGenre = strGenre.replace('&amp;','&')
            # Get the airdate to use for Aired
            if shownode.nodeName == 'originalAirDate':
              strAirdate = shownode.toxml()
              strAirdate = strAirdate.replace('<originalAirDate>','')
              strAirdate = strAirdate.replace('</originalAirDate>','')
              strAirdate = strAirdate[:10]
              # now that we have the title, episode, genre and description, create a showname string depending on which ones you have
              # if there is no episode name use the description in the title
            if len(strEpisode) == 0:
              strShowname = strTitle+' - '+strDescription
              strPlot = strDescription
              # else if there is an episode use that
            elif len(strEpisode) > 0:
              if name == 'All Shows' or name == 'Sports': 
                strShowname = strTitle+' - '+strEpisode
              elif name != 'All Shows' and name != 'Sports':
                strShowname = strEpisode
              strPlot = strDescription
            if shownode.nodeName == 'airing':
              for shownode1 in shownode.childNodes:
                if shownode1.nodeName == 'mediafile':
                  strMediaFileID = shownode1.getAttribute('sageDbId')
                  for shownode2 in shownode1.childNodes:
                    if shownode2.nodeName == 'segmentList':
                      shownode3 =  shownode2.childNodes[1]
                      strFilepath = shownode3.getAttribute('filePath')
                      addLink(strShowname,strFilepath.replace(sage_rec, sage_unc),strPlot,'',strGenre,strAirdate,strTitle,strMediaFileID)

def get_params():
        param=[]
        paramstring=sys.argv[2]
        if len(paramstring)>=2:
                params=sys.argv[2]
                cleanedparams=params.replace('?','')
                if (params[len(params)-1]=='/'):
                        params=params[0:len(params)-2]
                pairsofparams=cleanedparams.split('&')
                param={}
                for i in range(len(pairsofparams)):
                        splitparams={}
                        splitparams=pairsofparams[i].split('=')
                        if (len(splitparams))==2:
                                param[splitparams[0]]=splitparams[1]
                                
        return param

def addLink(name,url,plot,iconimage,genre,airdate,showtitle,fileid):
        ok=True
        liz=xbmcgui.ListItem(name)
        strDelete = 'http://' + __settings__.getSetting("sage_user") + ':' + __settings__.getSetting("sage_pass") + '@' + __settings__.getSetting("sage_ip") + ':' + __settings__.getSetting("sage_port") + '/sagex/api?command=DeleteFile&1=mediafile:' + fileid
        liz.addContextMenuItems([('Delete', 'PlayMedia(' + strDelete + ')',)])
        liz.setInfo( type="Video", infoLabels={ "Title": name, "Plot": plot, "Genre": genre, "aired": airdate, "TVShowTitle": showtitle } )
        ok=xbmcplugin.addDirectoryItem(handle=int(sys.argv[1]),url=url,listitem=liz,isFolder=False)
        return ok


def addDir(name,url,mode,iconimage):
        u=sys.argv[0]+"?url="+urllib.quote_plus(url)+"&mode="+str(mode)+"&name="+urllib.quote_plus(name)
        ok=True
        liz=xbmcgui.ListItem(name)
        liz.setInfo(type="TV Show", infoLabels={ "Title": name } )
        liz.setIconImage(xbmc.translatePath(os.path.join(os.getcwd().replace(';', ''),'resources','media',iconimage)))
        liz.setThumbnailImage(xbmc.translatePath(os.path.join(os.getcwd().replace(';', ''),'resources','media',iconimage)))
        ok=xbmcplugin.addDirectoryItem(handle=int(sys.argv[1]),url=u,listitem=liz,isFolder=True)
        return ok
        
              
params=get_params()
url=None
name=None
mode=None

try:
        url=urllib.unquote_plus(params["url"])
except:
        pass
try:
        name=urllib.unquote_plus(params["name"])
except:
        pass
try:
        mode=int(params["mode"])
except:
        pass

if mode==None or url==None or len(url)<1:
        print ""
        CATEGORIES()
       
elif mode==1:
        print ""+url
        INDEX(url)
        
elif mode==2:
        print ""+url
        VIDEOLINKS(url,name)

xbmcplugin.addSortMethod(int(sys.argv[1]), xbmcplugin.SORT_METHOD_DATE)
xbmcplugin.addSortMethod(int(sys.argv[1]), xbmcplugin.SORT_METHOD_TITLE)
xbmcplugin.setContent(int(sys.argv[1]),'episodes')
xbmcplugin.endOfDirectory(int(sys.argv[1]))