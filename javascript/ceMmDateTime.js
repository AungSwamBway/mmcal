// File: ceMmDateTime.js
// Description: Modern Myanmar Calendrical Calculations
//-------------------------------------------------------------------------
// WebSite: https://yan9a.github.io/mcal/
// MIT License (https://opensource.org/licenses/MIT)
// Copyright (c) 2018 Yan Naing Aye
// Doc: http://cool-emerald.blogspot.com/2013/06/algorithm-program-and-calculation-of.html
//-------------------------------------------------------------------------
class ceDateTime {
constructor(m_jd,m_tz,m_ct = 0,m_SG = 2361222) {
	// 2361222 - Gregorian start in British calendar (1752/Sep/14)
	if(m_tz==undefined) this.m_tz=ceDateTime.ltzoh();
	else this.m_tz = m_tz;// time zone for this particular instance 
	if(m_jd==undefined) this.m_jd=ceDateTime.jdnow();
	else this.m_jd = m_jd;// julian date in UTC
	this.m_ct = m_ct; // calendar type [0=British (default), 1=Gregorian, 2=Julian]
	this.m_SG = m_SG; // Beginning of Gregorian calendar in JDN [default=2361222]
}    
//Start of core functions #############################################################
//-------------------------------------------------------------------------
//Julian date to Western date
//Credit4 Gregorian date: http://pmyers.pcug.org.au/General/JulianDates.htm
//Credit4 Julian Calendar: http://quasar.as.utexas.edu/BillInfo/JulianDatesG.html
//input: (jd:julian date,
  // ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian]
  // SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
//output: Western date (y=year, m=month, d=day, h=hour, n=minute, s=second)
static j2w(jd,ct=0,SG=2361222) {
	// 2361222-Gregorian start in British calendar (1752/Sep/14)
	var j,jf,y,m,d,h,n,s;
	if (ct==2 || (ct==0 && (jd<SG))) {
		var b,c,f,e;
		j=Math.floor(jd+0.5); jf=jd+0.5-j;
		b=j+1524; c=Math.floor((b-122.1)/365.25); f=Math.floor(365.25*c);
		e=Math.floor((b-f)/30.6001); m=(e>13)?(e-13):(e-1);
		d=b-f-Math.floor(30.6001*e); y=m<3?(c-4715):(c-4716);
	}
	else{
		j=Math.floor(jd+0.5); jf=jd+0.5-j; j-=1721119;
		y=Math.floor((4*j-1)/146097); j=4*j-1-146097*y; d=Math.floor(j/4);
		j=Math.floor((4*d+3)/1461); d=4*d+3-1461*j;
		d=Math.floor((d+4)/4); m=Math.floor((5*d-3)/153); d=5*d-3-153*m;
		d=Math.floor((d+5)/5); y=100*y+j;
		if(m<10) {m+=3;}
		else {m-=9; y=y+1;}
	}
	jf*=24; h=Math.floor(jf); jf=(jf-h)*60; n=Math.floor(jf); s=(jf-n)*60;
	return {y:y,m:m,d:d,h:h,n:n,s:s};
}
//-------------------------------------------------------------------------
//Time to Fraction of day starting from 12 noon
//input: (h=hour, n=minute, s=second) output: (d: fraction of day)
static t2d(h,n,s) { return ((h-12)/24+n/1440+s/86400);}
//-------------------------------------------------------------------------
//Western date to Julian date
//Credit4 Gregorian2JD: http://www.cs.utsa.edu/~cs1063/projects/Spring2011/Project1/jdn-explanation.html
//input: (y: year, m: month, d: day, h=hour, n=minute, s=second,
  // ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian]
  // SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
//output: Julian date
static w2j(y,m,d,h=12,n=0,s=0,ct=0,SG=2361222) {
	// 2361222-Gregorian start in British calendar (1752/Sep/14)
	var a=Math.floor((14-m)/12); y=y+4800-a; m=m+(12*a)-3;
	var jd=d+Math.floor((153*m+2)/5)+(365*y)+Math.floor(y/4);
	if (ct==1) jd=jd-Math.floor(y/100)+Math.floor(y/400)-32045;
	else if (ct==2) jd=jd-32083;
	else {
		jd=jd-Math.floor(y/100)+Math.floor(y/400)-32045;
		if(jd<SG) {
			jd=d+Math.floor((153*m+2)/5)+(365*y)+Math.floor(y/4)-32083;
			if(jd>SG) jd=SG;
		}
	}
	return jd+ceDateTime.t2d(h,n,s);
}
//-------------------------------------------------------------------------
// convert unix timestamp to jd 
static u2j(ut)
{
	//number of seconds from 1970 Jan 1 00:00:00 (UTC)
	var jd=2440587.5+ut/86400.0;//converte to day(/24h/60min/60sec) and to JD
	return jd;
}
//-------------------------------------------------------------------------
// julian date to unix time
static j2u(jd)
{
	return (jd-2440587.5)*86400.0+0.5;
}
//-------------------------------------------------------------------------
// get current time in julian date
static jdnow()
{
	var dt=new Date();
	// the number of milliseconds since 1 January 1970 00:00:00 / 1000
	var ut=dt.getTime()/1000.0;	
	return ceDateTime.u2j(ut);
}
//-------------------------------------------------------------------------
// get local time zone offset between local time and UTC in days
static ltzoh()
{
	var dt=new Date();
	// the difference, in minutes, between UTC and local time
	var tz=dt.getTimezoneOffset()/60.0;
	return -tz; // between local time and UTC
}
//-------------------------------------------------------------------------
// jd to date time string
// input: (jd:julian date,
//  fs: format string [Optional argument: "%Www %y-%mm-%dd %HH:%nn:%ss %zz"]
//  tz : time zone offset in hours (e.g. 8 for GMT +8)
//  ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian]
//  SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
// output: date time string according to fm where formatting strings are as follows
// %yyyy : year [0000-9999, e.g. 2018]
// %yy : year [00-99 e.g. 18]
// %y : year [0-9999, e.g. 201]
// %MMM : month [e.g. JAN]
// %Mmm : month [e.g. Jan]
// %mm : month with zero padding [01-12]
// %M : month [e.g. January]
// %m : month [1-12]
// %dd : day with zero padding [01-31]
// %d : day [1-31]
// %HH : hour [00-23]
// %hh : hour [01-12]
// %H : hour [0-23]
// %h : hour [1-12]
// %AA : AM or PM
// %aa : am or pm
// %nn : minute with zero padding [00-59]
// %n : minute [0-59]
// %ss : second [00-59]
// %s : second [0-59]
// %lll : millisecond [000-999]
// %l : millisecond [0-999]
// %WWW : Weekday [e.g. SAT]
// %Www : Weekday [e.g. Sat]
// %W : Weekday [e.g. Saturday]
// %w : Weekday number [0=sat, 1=sun, ..., 6=fri]
// %zz : time zone (e.g. +08, +06:30)
static j2s(jd,fs="%Www %y-%mm-%dd %HH:%nn:%ss %zz",tz=0,ct=0,SG=2361222)
{	
	jd+=tz/24.0;
	var dt=ceDateTime.j2w(jd,ct,SG);	
	var s=Math.floor(dt.s);//shold not take round to make sure s<60
	var l=Math.floor((dt.s-s)*1000); // not rounding
	var jdn=Math.floor(jd+0.5);
	var wd=(jdn+2)%7;//week day [0=sat, 1=sun, ..., 6=fri]
	var h = dt.h % 12;
	if (h == 0) h = 12;
	var W = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
	var M = ["January","February","March","April","May","June","July","August","September","October","November","December"];

	// replace format string with values
	var fm=fs; var fstr,rstr,re;
	//--------------------------------------------------------
	fstr = "%yyyy"; re = new RegExp(fstr, 'g');
	rstr = "0000" + dt.y.toString(); rstr = rstr.substr(rstr.length - 4); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%yy"; var y = dt.y % 100;  re = new RegExp(fstr, 'g');
	rstr = "00" + y.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%y"; re = new RegExp(fstr, 'g');
	rstr = dt.y.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%MMM";  re = new RegExp(fstr, 'g');
	rstr = M[dt.m-1]; rstr = rstr.substr(0,3); rstr=rstr.toUpperCase(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%Mmm";  re = new RegExp(fstr, 'g');
	rstr = M[dt.m-1]; rstr = rstr.substr(0,3); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%mm";  re = new RegExp(fstr, 'g');
	rstr = "00" + dt.m.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%M";  re = new RegExp(fstr, 'g');
	rstr = M[dt.m-1]; fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%m";  re = new RegExp(fstr, 'g');
	rstr = dt.m.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%dd";  re = new RegExp(fstr, 'g');
	rstr = "00" + dt.d.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%d";  re = new RegExp(fstr, 'g');
	rstr = dt.d.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%HH";  re = new RegExp(fstr, 'g');
	rstr = "00" + dt.h.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%H";  re = new RegExp(fstr, 'g');
	rstr = dt.h.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%hh";  re = new RegExp(fstr, 'g');
	rstr = "00" + h.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%h";  re = new RegExp(fstr, 'g');
	rstr = h.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%AA";  re = new RegExp(fstr, 'g');
	rstr = dt.h<12?"AM":"PM"; fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%aa";  re = new RegExp(fstr, 'g');
	rstr = dt.h<12 ? "am" : "pm"; fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%nn"; re = new RegExp(fstr, 'g'); 
	rstr = "00" + dt.n.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%n"; re = new RegExp(fstr, 'g');
	rstr = dt.n.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%ss"; re = new RegExp(fstr, 'g'); 
	rstr = "00" + s.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%s"; re = new RegExp(fstr, 'g');
	rstr = s.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%lll"; re = new RegExp(fstr, 'g'); 
	rstr = "000" + l.toString(); rstr = rstr.substr(rstr.length - 3); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%l"; re = new RegExp(fstr, 'g');
	rstr = l.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%WWW"; re = new RegExp(fstr, 'g');
	rstr = W[wd]; rstr = rstr.substr(0,3); rstr=rstr.toUpperCase(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%Www"; re = new RegExp(fstr, 'g');
	rstr = W[wd]; rstr = rstr.substr(0,3); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%W"; re = new RegExp(fstr, 'g');
	rstr = W[wd]; fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%w"; re = new RegExp(fstr, 'g');
	rstr = wd.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "%zz"; re = new RegExp(fstr, 'g');
	var tzs = tz < 0 ? "-" : "+";
	var tzi = Math.floor(tz);
	var tzh = "00" + tzi.toString();
	tzh = tzh.substr(tzh.length - 2);
	rstr = tzs+tzh;
	var tzf = tz - tzi;
	if (tzf > 0) {
		tzh = "00" + Math.floor(tzf*60.0+0.5).toString();
		tzh = tzh.substr(tzh.length - 2);
		rstr += ":"+tzh;
	}
	fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	return fm;
}
//-------------------------------------------------------------------------
// convert date time string to jd
// inputs
//  tstr : time string
//    accepts following formats
//    1: yyyy-mm-dd hh:nn:ss
//    2: yyyy-mm-dd hh:nn:ss.ttt
//    3: yyyymmddhhnnss
//    4: yyyymmddhhnnssttt
//    5: yyyy-mm-dd (default time is 12:00:00)
//    6: yyyymmdd (default time is 12:00:00)
//  tz : time zone offset in hours
//   [optional argument: 0 - UTC]
//  ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian]
//  SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
// output 
//  jd: julian date 
//    positive integer: ok
//    -1 : error
static s2j(tstr,tz=0,ct=0,SG=2361222)
{
    var str,pstr;
    var y=0,m=0,d=0,h=12,n=0,s=0,ls=0;
    var jd=-1;
    str=ceDateTime.GetDigits(tstr);
    if(str.length==8 || str.length==14 || str.length==17){        
        pstr=str.substr(0,4); y=parseInt(pstr); //get year
        pstr=str.substr(4,2); m=parseInt(pstr); //get month
		pstr=str.substr(6,2); d=parseInt(pstr); //get day
		if(str.length==14 || str.length==17){
			pstr=str.substr(8,2); h=parseInt(pstr); //get hour
			pstr=str.substr(10,2); n=parseInt(pstr); //get minute
			pstr=str.substr(12,2); s=parseInt(pstr); //get second
			if(str.length==17){ 
				pstr=str.substr(14,3); ls=parseInt(pstr); 
				s+=ls/1000.0; 
			}
		}
        jd=ceDateTime.w2j(y,m,d,h,n,s,ct,SG)-tz/24.0;  // convert to UTC      
    }
    return jd;
}
//-------------------------------------------------------------------------
// set time zone in hours for this instance
SetTimezone(tz)//set time zone
{
	if(tz==undefined){ this.m_tz=ceDateTime.ltzoh(); }
    else if(tz<=14 || tz>=(-12)){ this.m_tz=tz; }
}
//-------------------------------------------------------------------------
// set time to now
Set2Now()
{
	this.m_jd = ceDateTime.jdnow();
}
//-------------------------------------------------------------------------
// set time in jd
SetJD(jd)
{
	this.m_jd=jd;
}
//-------------------------------------------------------------------------
// set in unix time
SetUnixTime(ut)
{
    this.m_jd=ceDateTime.u2j(ut);
}
//-------------------------------------------------------------------------
// set date time for a timezone and a calendar type
SetDateTime(year,month,day,hour=12,minute=0,second=0,tz=0,ct=0,SG=2361222)
{
    this.m_jd=ceDateTime.w2j(year,month,day,hour,minute,second,ct,SG)-tz/24.0;
}
//-------------------------------------------------------------------------
// set time using a date time string
// inputs
//  tstr : time string
//    accepts following formats
//    1: yyyy-mm-dd hh:nn:ss
//    2: yyyy-mm-dd hh:nn:ss.ttt
//    3: yyyymmddhhnnss
//    4: yyyymmddhhnnssttt
//  tz : time zone offset in hours
//   [optional argument: 0 - UTC]
//  ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian]
//  SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
SetDateTimeString(tstr,tz=0,ct=0,SG=2361222)
{
	var jd=ceDateTime.s2j(tstr,tz,ct,SG);
    if(jd>=0) this.m_jd=jd;
}
//-------------------------------------------------------------------------
// set calendar type [0=British (default), 1=Gregorian, 2=Julian]
SetCT(ct)
{
	ct=Math.round(ct%3);
    this.m_ct=ct;
}
//-------------------------------------------------------------------------
// set Beginning of Gregorian calendar in JDN [default=2361222]
SetSG(sg)
{
	sg=Math.round(sg);
    this.m_SG=sg;
}
//-------------------------------------------------------------------------
// Get Date Time string
// input: (fs: format string [Optional argument: "%Www %y-%mm-%dd %HH:%nn:%ss %zz"])
// output: date time string according to fm where formatting strings are as follows
// %yyyy : year [0000-9999, e.g. 2018]
// %yy : year [00-99 e.g. 18]
// %y : year [0-9999, e.g. 201]
// %MMM : month [e.g. JAN]
// %Mmm : month [e.g. Jan]
// %mm : month with zero padding [01-12]
// %M : month [e.g. January]
// %m : month [1-12]
// %dd : day with zero padding [01-31]
// %d : day [1-31]
// %HH : hour [00-23]
// %hh : hour [01-12]
// %H : hour [0-23]
// %h : hour [1-12]
// %AA : AM or PM
// %aa : am or pm
// %nn : minute with zero padding [00-59]
// %n : minute [0-59]
// %ss : second [00-59]
// %s : second [0-59]
// %lll : millisecond [000-999]
// %l : millisecond [0-999]
// %WWW : Weekday [e.g. SAT]
// %Www : Weekday [e.g. Sat]
// %W : Weekday [e.g. Saturday]
// %w : Weekday number [0=sat, 1=sun, ..., 6=fri]
// %zz : time zone (e.g. +08, +06:30)
ToString(fs="%Www %y-%mm-%dd %HH:%nn:%ss %zz")
{
	return ceDateTime.j2s(this.m_jd, fs, this.m_tz, this.m_ct, this.m_SG);
}
//-------------------------------------------------------------------------
// filter input string to get digits only
static GetDigits(str)
{
    var ostr=""; var len=str.length; var i=0;
    if(len>0){ for(i=0;i<len;i++) if(str[i]>='0' && str[i]<='9') ostr += str[i]; }
    return ostr;
}
//-------------------------------------------------------------------------
// get properties
get jd() { return this.m_jd;} // julian date
get jdl() { return (this.m_jd+this.m_tz/24.0);} // julian date for this time zone
get jdn(){ return Math.round(this.m_jd);} // julian date number
get jdnl(){ return Math.round(this.m_jd+this.m_tz/24.0);} // julian date number for this time zone
get y(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	return dt.y;
} // year

get m(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	return dt.m;
} // month

get d(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	return dt.d;
} // day

get h(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	return dt.h;
} // hour [0-23]

get n(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	return dt.n;
} // minute

get s(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	var s=Math.floor(dt.s);//shold not take round to make sure s<60
	return s;
} // second

get l(){ 
	var dt = ceDateTime.j2w(this.jdl,this.m_ct,this.m_SG);
	var s=Math.floor(dt.s);//shold not take round to make sure s<60
	var l=Math.floor((dt.s-s)*1000); // not rounding
	return l;
} // millisecond

get w(){ return (this.jdnl+2)%7;} // weekday [0=sat, 1=sun, ..., 6=fri]
get ut(){ return ceDateTime.j2u(this.m_jd);} // unix time
get tz(){ return this.m_tz;} // time zone 
get ct(){ return this.m_ct;} // calendar type
get SG(){ return this.m_SG;} // Beginning of Gregorian calendar in JDN [default=2361222]
get mlen(){ return ceDateTime.wml(this.y,this.m,this.m_ct,this.m_SG);} // length of this month
//----------------------------------------------------------------------------
// find the length of western month
// input: (y=year, m=month [Jan=1, ... , Dec=12],
//  ct:calendar type [Optional argument: 0=British (default), 1=Gregorian, 2=Julian])
//  SG: Beginning of Gregorian calendar in JDN [Optional argument: (default=2361222)])
// output: (wml = length of the month)
static wml(y,m,ct=0,SG=2361222) {
	var j1,j2; var m2=m+1; var y2=y;
	if(m2>12){y2++; m2%=12;}
	j1=ceDateTime.w2j(y,m,1,12,0,0,ct,SG);
	j2=ceDateTime.w2j(y2,m2,1,12,0,0,ct,SG);
	return (j2-j1);
}
//-------------------------------------------------------------------------
} //ceDateTime

//-------------------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//-------------------------------------------------------------------------

class ceMmDateTime extends ceDateTime {
//-------------------------------------------------------------------------
constructor(m_jd,m_tz,m_ct = 0,m_SG = 2361222) {
	super(m_jd,m_tz,m_ct,m_SG);
}
//-------------------------------------------------------------------------
// Get Myanmar year constants depending on era
// Thanks to Myo Zarny and Wunna Ko for earlier Myanmar years data
// input: my = myanmar year
// output:  
//  EI = Myanmar calendar era id [1-3] : calculations methods/constants depends on era
//  WO = watat offset to compensate
//  NM = number of months to find excess days
//  EW = exception in watat year
static GetMyConst(my)
{
	var EI,WO,NM,EW=0,i; var fme,wte;
	// The third era (the era after Independence 1312 ME and after)
	if(my >= 1312){ 
		EI = 3; WO=-0.5; NM=8;				
		fme = [[1377,1]]; 		
		wte = [1344,1345];
	}
	// The second era (the era under British colony: 1217 ME - 1311 ME)
	else if(my >= 1217){
		EI = 2; WO=-1; NM=4;
		fme = [[1234,1],[1261,-1]];
		wte = [1263,1264];
	}
	// The first era (the era of Myanmar kings: ME1216 and before)
	// Thandeikta (ME 1100 - 1216)
	else if(my >= 1100){
		EI = 1.3; WO=-0.85; NM=-1;
		fme = [[1120,1],[1126,-1],[1150,1],[1172,-1],[1207,1]]; 
		wte = [1201,1202];
	}
	// Makaranta system 2 (ME 798 - 1099)
	else if(my >= 798){
		EI = 1.2; WO=-1.1; NM=-1;
		fme = [[813,-1],[849,-1],[851,-1],[854,-1],[927,-1],[933,-1],[936,-1],
		[938,-1],[949,-1],[952,-1],[963,-1],[968,-1],[1039,-1]];	
		wte=[];	
	}
	// Makaranta system 1 (ME 0 - 797)
	else {
		EI = 1.1; WO=-1.1; NM=-1;
		fme = [[205,1],[246,1],[471,1],[572,-1],[651,1],[653,2],[656,1],[672,1],
		[729,1], [767,-1]];		
		wte=[];
	}
	i=ceMmDateTime.bSearch2(my,fme); if(i >= 0) WO+=fme[i][1]; // full moon day offset exceptions
	i=ceMmDateTime.bSearch1(my,wte); if(i >= 0) EW = 1; //correct watat exceptions

	return {EI:EI,WO:WO,NM:NM,EW:EW};
}
//----------------------------------------------------------------------------
// Search first dimension in a 2D array
// input: (k=key,A=array)
// output: (i=index)
static bSearch2(k,A) {
	var i=0; var l=0; var u=A.length-1;
	while(u>=l) {
		i=Math.floor((l+u)/2);
		if (A[i][0]>k)  u=i-1;
		else if (A[i][0]<k) l=i+1;
		else return i;
	} return -1;
}
//-----------------------------------------------------------------------------
// Search a 1D array
// input: (k=key,A=array)
// output: (i=index)
static bSearch1(k,A) {
	var i=0; var l=0; var u=A.length-1;
	while(u>=l) {
		i=Math.floor((l+u)/2);
		if (A[i]>k)  u=i-1;
		else if (A[i]<k) l=i+1;
		else return i;
	} return -1;
}
//-------------------------------------------------------------------------
// Check watat (intercalary month)
// input: (my = myanmar year)
// output:  ( watat = intercalary month [1=watat, 0=common]
  //  fm = full moon day of 2nd Waso in jdn_mm (jdn+6.5 for MMT) [only valid when watat=1])
// dependency: GetMyConst(my)
static cal_watat(my) {//get data for respective era	
	var SY=1577917828.0/4320000.0; //solar year (365.2587565)
	var LM=1577917828.0/53433336.0; //lunar month (29.53058795)
	var MO=1954168.050623; //beginning of 0 ME for MMT
	var c=ceMmDateTime.GetMyConst(my); // get constants for the corresponding calendar era
	var TA=(SY/12-LM)*(12-c.NM); //threshold to adjust
	var ed=(SY*(my+3739))%LM; // excess day
	if(ed < TA) ed+=LM;//adjust excess days
	var fm=Math.round(SY*my+MO-ed+4.5*LM+c.WO);//full moon day of 2nd Waso
	var TW=0,watat=0;//find watat
	if (c.EI >= 2) {//if 2nd era or later find watat based on excess days
		TW=LM-(SY/12-LM)*c.NM;
		if(ed >= TW) watat=1;
	}
	else {//if 1st era,find watat by 19 years metonic cycle
	//Myanmar year is divided by 19 and there is intercalary month
	//if the remainder is 2,5,7,10,13,15,18
	//https://github.com/kanasimi/CeJS/blob/master/data/date/calendar.js#L2330
		watat=(my*7+2)%19; if (watat < 0) watat+=19;
		watat=Math.floor(watat/12);
	}
	watat^=c.EW;//correct watat exceptions	
	return {fm:fm,watat:watat};
}
//-------------------------------------------------------------------------
// Check Myanmar Year
// input: (my -myanmar year)
// output:  (myt =year type [0=common, 1=little watat, 2=big watat],
  // tg1 = the 1st day of Tagu as jdn_mm (Julian Day Number for MMT)
  // fm = full moon day of [2nd] Waso as Julain Day Number
  // werr= watat discrepancy [0=ok, 1= error] )
// dependency: cal_watat(my)
static cal_my(my) {
	var yd=0,y1,nd=0,werr=0,fm=0;
	var y2=ceMmDateTime.cal_watat(my); var myt=y2.watat;
	do{ yd++; y1=ceMmDateTime.cal_watat(my-yd);}while(y1.watat==0 && yd < 3);
	if(myt) { nd=(y2.fm-y1.fm)%354; myt=Math.floor(nd/31)+1;
		fm=y2.fm; if(nd!=30 && nd!=31) {werr=1;} }
	else fm=y1.fm+354*yd;
	var tg1=y1.fm+354*yd-102;
	return {myt:myt,tg1:tg1,fm:fm,werr:werr};
}
//-------------------------------------------------------------------------
// Julian day number to Myanmar date
// input: (jdn -julian day number)
// output:  (
  // myt =year type [0=common, 1=little watat, 2=big watat],
  // my = year,
  // mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
  //   Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11, 
  //   Tabaung=12, Late Tagu=13, Late Kason=14 ],
  // md = day of the month [1 to 30])
// dependency: cal_my(my)
static j2m(jdn) {
	jdn=Math.round(jdn);//convert jdn to integer
	var SY=1577917828.0/4320000.0; //solar year (365.2587565)
	var MO=1954168.050623; //beginning of 0 ME
	var my,yo,dd,myl,mmt,a,b,c,e,f,mm,md;
	my=Math.floor((jdn-0.5-MO)/SY);//Myanmar year
	yo=ceMmDateTime.cal_my(my);//check year
	dd=jdn-yo.tg1+1;//day count
	b=Math.floor(yo.myt/2); c=Math.floor(1/(yo.myt+1)); //big wa and common yr
	myl=354+(1-c)*30+b;//year length
	mmt=Math.floor((dd-1)/myl);//month type: late =1 or early = 0
	dd-=mmt*myl; a=Math.floor((dd+423)/512); //adjust day count and threshold
	mm=Math.floor((dd-b*a+c*a*30+29.26)/29.544);//month
	e=Math.floor((mm+12)/16); f=Math.floor((mm+11)/16);
    md=dd-Math.floor(29.544*mm-29.26)-b*e+c*f*30;//day
    mm+=f*3-e*4+12*mmt; // adjust month numbers for late months
	return {myt:yo.myt,my:my,mm:mm,md:md};
}
//-------------------------------------------------------------------------
// Get moon phase from day of the month, month, and year type.
// input: (
//    md= day of the month [1-30], 
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    myt = year type [0=common, 1=little watat, 2=big watat])
// output: (mp =moon phase [0=waxing, 1=full moon, 2=waning, 3=new moon])
static cal_mp(md,mm,myt) {
	var mml=ceMmDateTime.cal_mml(mm,myt);
	return (Math.floor((md+1)/16)+Math.floor(md/16)+Math.floor(md/mml));
}
//-------------------------------------------------------------------------
// Get length of month from month, and year type.
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    myt = year type [0=common, 1=little watat, 2=big watat])
// output: (mml = length of the month [29 or 30 days])
static cal_mml(mm,myt) {
	var mml=30-mm%2;//month length
	if(mm==3) mml+=Math.floor(myt/2);//adjust if Nayon in big watat
	return mml;
}
//-------------------------------------------------------------------------
// Get the apparent length of the year from year type.
// input: ( myt = year type [0=common, 1=little watat, 2=big watat])
// output: ( myl= year length [354, 384, or 385 days])
static cal_myl(myt) {
	return (354+(1-Math.floor(1/(myt+1)))*30+Math.floor(myt/2));
}
//-------------------------------------------------------------------------
// Get fortnight day from month day
// input: ( md= day of the month [1-30])
// output: (mf= fortnight day [1 to 15])
static cal_mf(md) {
	return (md-15*Math.floor(md/16));
}
//-------------------------------------------------------------------------
// Get day of month from fortnight day, moon phase, and length of the month
// input: ( 
//   mf = fortnight day [1 to 15], 
//   mp = moon phase [0=waxing, 1=full moon, 2=waning, 3=new moon]
//   mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//        Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//        Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//   myt = year type [0=common, 1=little watat, 2=big watat])
// output: ( md = day of the month [1-30])
static cal_md(mf,mp,mm,myt) {
	var mml=ceMmDateTime.cal_mml(mm,myt);
	var m1=mp%2; var m2=Math.floor(mp/2);
	return (m1*(15+m2*(mml-15))+(1-m1)*(mf+15*m2));
}
//-------------------------------------------------------------------------
// Myanmar date to Julian day number
// input:  (
//  my = year,
//  mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//    Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//    Tabaung=12 , Late Tagu=13, Late Kason=14 ],
//  md = day of the month [1-30]
// output: (jd -julian day number)
// dependency: cal_my(my)
static m2j(my,mm,md) {
	var b,c,dd,myl,mmt;
	var yo=ceMmDateTime.cal_my(my);//check year
	mmt=Math.floor(mm/13); mm=mm%13+mmt; // to 1-12 with month type
	b=Math.floor(yo.myt/2); c=1-Math.floor((yo.myt+1)/2); //if big watat and common year	 
	mm+=4-Math.floor((mm+15)/16)*4+Math.floor((mm+12)/16);//adjust month
	dd=md+Math.floor(29.544*mm-29.26)-c*Math.floor((mm+11)/16)*30
		+b*Math.floor((mm+12)/16);	
	myl=354+(1-c)*30+b; dd+=mmt*myl;//adjust day count with year length
	return (dd+yo.tg1-1);
}
//-------------------------------------------------------------------------
//Checking Astrological days
// More details @ http://cool-emerald.blogspot.sg/2013/12/myanmar-astrological-calendar-days.html
//-------------------------------------------------------------------------
// Get sabbath day and sabbath eve from day of the month, month, and year type.
// input: (
//    md= day of the month [1-30], 
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    myt = year type [0=common, 1=little watat, 2=big watat])
// output: ( [1=sabbath, 2=sabbath eve, 0=else])
static cal_sabbath(md,mm,myt){
	var mml=ceMmDateTime.cal_mml(mm,myt);
	var s=0; if((md==8)||(md==15)||(md==23)||(md==mml)) s=1;
	if((md==7)||(md==14)||(md==22)||(md==(mml-1))) s=2;
	return s;
}
//-------------------------------------------------------------------------
// Get yatyaza from month, and weekday
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=yatyaza, 0=else])
static cal_yatyaza(mm,wd){
	//first waso is considered waso
	var m1=mm%4; var yatyaza=0; var wd1=Math.floor(m1/2)+4;
	var wd2=((1-Math.floor(m1/2))+m1%2)*(1+2*(m1%2));
	if((wd==wd1)||(wd==wd2)) yatyaza=1;
	return yatyaza;
}
//-------------------------------------------------------------------------
// Get pyathada from month, and weekday
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=pyathada, 2=afternoon pyathada, 0=else])
static cal_pyathada(mm,wd){
	//first waso is considered waso
	var m1=mm%4; var pyathada=0; var wda=[1,3,3,0,2,1,2]; 	
	if((m1==0)&&(wd==4)) pyathada=2;//afternoon pyathada
	if(m1==wda[wd]) pyathada=1;
	return pyathada;
}
//-------------------------------------------------------------------------
// nagahle 
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ])
// output: ( [0=west, 1=north, 2=east, 3=south])
static cal_nagahle(mm) {
	if (mm<=0) mm=4;//first waso is considered waso
	return Math.floor((mm%12)/3);
}
//-------------------------------------------------------------------------
// mahabote 
// input: (
//  my = year,
//  wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [0=Binga, 1=Atun, 2=Yaza, 3=Adipati, 4= Marana, 5=Thike, 6=Puti])
static cal_mahabote(my,wd) {return (my-wd)%7;}
//-------------------------------------------------------------------------
// nakhat 
// input: ( my = year )
// output: ( [0=Ogre, 1=Spirit, 2=Human] )
static cal_nakhat(my) {return my%3;}
//-------------------------------------------------------------------------
// thamanyo 
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=thamanyo, 0=else])
static cal_thamanyo(mm,wd) {
	var mmt=Math.floor(mm/13); mm=mm%13+mmt; // to 1-12 with month type
	if (mm<=0) mm=4;//first waso is considered waso (looks no need here)
	var thamanyo=0; 
	var m1=mm-1-Math.floor(mm/9); 
	var wd1=(m1*2-Math.floor(m1/8))%7;
	var wd2=(wd+7-wd1)%7; 
	if(wd2<=1) thamanyo=1;
	return thamanyo;
}
//-------------------------------------------------------------------------
// Get amyeittasote
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=amyeittasote, 0=else])
static cal_amyeittasote(md,wd) {
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var amyeittasote=0; var wda=[5,8,3,7,2,4,1]; 
	if(mf==wda[wd]) amyeittasote=1;
	return amyeittasote;
}
//-------------------------------------------------------------------------
// Get warameittugyi
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=warameittugyi, 0=else])
static cal_warameittugyi(md,wd) {
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var warameittugyi=0; var wda=[7,1,4,8,9,6,3]; 
	if(mf==wda[wd]) warameittugyi=1;
	return warameittugyi;
}
//-------------------------------------------------------------------------
// Get warameittunge
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=warameittunge, 0=else])
static cal_warameittunge(md,wd) {
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var warameittunge=0; var wn=(wd+6)%7; 
	if((12-mf)==wn) warameittunge=1;
	return warameittunge;
}
//-------------------------------------------------------------------------
// Get yatpote
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=yatpote, 0=else])
static cal_yatpote(md,wd) {
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var yatpote=0; var wda=[8,1,4,6,9,8,7]; 
	if(mf==wda[wd]) yatpote=1;
	return yatpote;
}
//-------------------------------------------------------------------------
// Get thamaphyu
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=thamaphyu, 0=else])
static cal_thamaphyu(md,wd) {
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var thamaphyu=0; var wda=[1,2,6,6,5,6,7];  
	if(mf==wda[wd]) thamaphyu=1;
	var wdb=[0,1,0,0,0,3,3]; if(mf==wdb[wd]) thamaphyu=1;
	if((mf==4) && (wd==5)) thamaphyu=1;
	return thamaphyu;
}
//-------------------------------------------------------------------------
// Get nagapor
// input: (
//    md= day of the month [1-30], 
//    wd= weekday  [0=sat, 1=sun, ..., 6=fri])
// output: ( [1=nagapor, 0=else])
static cal_nagapor(md,wd) {
	var nagapor=0; var wda=[26,21,2,10,18,2,21];  
	if(md==wda[wd]) nagapor=1;
	var wdb=[17,19,1,0,9,0,0]; if(md==wdb[wd]) nagapor=1;
	if(((md==2)&&(wd==1))||(((md==12)||(md==4)||(md==18))&&(wd==2)))nagapor=1;
	return nagapor;
}
//-------------------------------------------------------------------------
// yatyotema 
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    md= day of the month [1-30])
// output: ( [1=yatyotema, 0=else])
static cal_yatyotema(mm,md) {
	var mmt=Math.floor(mm/13); mm=mm%13+mmt; // to 1-12 with month type
	if (mm<=0) mm=4;//first waso is considered waso
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var yatyotema=0; var m1=(mm%2)?mm:((mm+9)%12); 
	m1=(m1+4)%12+1; if(mf==m1)yatyotema=1;
	return yatyotema;
}
//-------------------------------------------------------------------------
// mahayatkyan 
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    md= day of the month [1-30])
// output: ( [1=mahayatkyan, 0=else])
static cal_mahayatkyan(mm,md) {
	if (mm<=0) mm=4;//first waso is considered waso
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var mahayatkyan=0; var m1=(Math.floor((mm%12)/2)+4)%6+1; 
	if(mf==m1) mahayatkyan=1;
	return mahayatkyan;
}
//-------------------------------------------------------------------------
// shanyat 
// input: (
//    mm = month [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//         Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//         Tabaung=12, Late Tagu=13, Late Kason=14 ], 
//    md= day of the month [1-30])
// output: ( [1=shanyat, 0=else])
static cal_shanyat(mm,md) {
	var mmt=Math.floor(mm/13); mm=mm%13+mmt; // to 1-12 with month type
	if (mm<=0) mm=4;//first waso is considered waso
	var mf=md-15*Math.floor(md/16);//get fortnight day [0-15]
	var shanyat=0; var sya=[8,8,2,2,9,3,3,5,1,4,7,4]; 
	if(mf==sya[mm-1]) shanyat=1;
	return shanyat;
}
//-------------------------------------------------------------------------
// get astrological information
// input: (jdn: Julian Day Number)
// output: (array of strings)
static cal_astro(jdn) {
	jdn=Math.round(jdn);
	var myt,my,mm,md; var hs=[]; 
	var yo=ceMmDateTime.j2m(jdn);
	myt=yo.myt; my=yo.my; mm = yo.mm; md=yo.md;
	var wd=(jdn+2)%7;//week day [0=sat, 1=sun, ..., 6=fri]
	if(ceMmDateTime.cal_thamanyo(mm,wd)) {hs.push("Thamanyo");}
	if(ceMmDateTime.cal_amyeittasote(md,wd)) {hs.push("Amyeittasote");}
	if(ceMmDateTime.cal_warameittugyi(md,wd)) {hs.push("Warameittugyi");}
	if(ceMmDateTime.cal_warameittunge(md,wd)) {hs.push("Warameittunge");}
	if(ceMmDateTime.cal_yatpote(md,wd)) {hs.push("Yatpote");}
	if(ceMmDateTime.cal_thamaphyu(md,wd)) {hs.push("Thamaphyu");}
	if(ceMmDateTime.cal_nagapor(md,wd)) {hs.push("Nagapor");}
	if(ceMmDateTime.cal_yatyotema(mm,md)) {hs.push("Yatyotema");}
	if(ceMmDateTime.cal_mahayatkyan(mm,md)) {hs.push("Mahayatkyan");}
	if(ceMmDateTime.cal_shanyat(mm,md)) {hs.push("Shanyat");}
	return hs;
}
// End of core functions ###############################################################

//-----------------------------------------------------------------------------
// Start of checking holidays ##################################################
//-----------------------------------------------------------------------------
// Get holidays
// input: (jdn=Julian Day Number)
// output: ( array of strings)
// Thanks to Ye Lin Kyaw and Aye Nyein for the knowledge about 
// the Myanmar calendar and the new year
static cal_holiday(jdn) {
	jdn=Math.round(jdn);
	var myt,my,mm,md,mp,mmt,gy,gm,gd;
	var yo=ceMmDateTime.j2m(jdn);
	myt=yo.myt; my=yo.my; mm = yo.mm; md=yo.md;
	mp=ceMmDateTime.cal_mp(md,mm,myt);
	mmt=Math.floor(mm/13); var hs=[];
	var go=ceDateTime.j2w(jdn);
	gy=go.y; gm=go.m; gd=go.d;
	//---------------------------------
	// Thingyan
	var SY=1577917828.0/4320000.0; //solar year (365.2587565)
	var MO=1954168.050623; //beginning of 0 ME
	var BGNTG=1100, SE3=1312;//start of Thingyan and third era
	var akn,atn,ja,jk;
	ja=SY*(my+mmt)+MO; // atat time
	if (my >= SE3) jk=ja-2.169918982; // akya time
	else jk=ja-2.1675;
	akn=Math.round(jk); atn=Math.round(ja);
	if(jdn==(atn+1)) {hs.push("Myanmar New Year's Day");}
	if ((my+mmt)>=BGNTG) {
		if(jdn==atn) {hs.push("Thingyan Atat");}
		else if((jdn>akn)&&(jdn<atn)) {hs.push("Thingyan Akyat");}
		else if(jdn==akn) {hs.push("Thingyan Akya");}
		else if(jdn==(akn-1)) {hs.push("Thingyan Akyo");}
		else if(((my+mmt)>=1369)&&((my+mmt)<1379)&&((jdn==(akn-2))||
			((jdn>=(atn+2))&&(jdn<=(akn+7))))) {hs.push("Holiday");}
	}
	//---------------------------------
	// holidays on gregorian calendar	
	if((gy>=2018) && (gm==1) && (gd==1)) {hs.push("New Year's Day");}
	else if((gy>=1948) && (gm==1) && (gd==4)) {hs.push("Independence Day");}
	else if((gy>=1947) && (gm==2) && (gd==12)) {hs.push("Union Day");}
	else if((gy>=1958) && (gm==3) && (gd==2)) {hs.push("Peasants' Day");}
	else if((gy>=1945) && (gm==3) && (gd==27)) {hs.push("Resistance Day");}
	else if((gy>=1923) && (gm==5) && (gd==1)) {hs.push("Labour Day");}
	else if((gy>=1947) && (gm==7) && (gd==19)) {hs.push("Martyrs' Day");}
	else if((gy>=1752) && (gm==12) && (gd==25)) {hs.push("Christmas Day");}
	else if((gy==2017) && (gm==12) && (gd==30)) {hs.push("Holiday");}
	else if((gy>=2017) && (gm==12) && (gd==31)) {hs.push("Holiday");}
	//---------------------------------
	// holidays on myanmar calendar
	if((mm==2) && (mp==1)) {hs.push("Buddha Day");}//Vesak day
	else if((mm==4)&& (mp==1)) {hs.push("Start of Buddhist Lent");}//Warso day
	else if((mm==7) && (mp==1)) {hs.push("End of Buddhist Lent");}
	else if((my>=1379) && (mm==7) && (md==14||md==16)) {hs.push("Holiday");}
	else if((mm==8) && (mp==1)) {hs.push("Tazaungdaing");}
	else if((my>=1379) && (mm==8) && (md==14)) {hs.push("Holiday");}
	else if((my>=1282) && (mm==8) && (md==25)) {hs.push("National Day");}
	else if((mm==10) && (md==1)) {hs.push("Karen New Year's Day");}
	else if((mm==12) && (mp==1)) {hs.push("Tabaung Pwe");}
	//---------------------------------
	// //other holidays	
	// var ghEid=[2456513,2456867,2457221,2457576,2457930,2458285,2458640];	
	// if(ceMmDateTime.bSearch1(jdn,ghEid)>=0) {hs.push("Eid");}

	// // var ghDiwali=[2456599,2456953,2457337,2457691,2458045,2458430,2458784];
	// // if(ceMmDateTime.bSearch1(jdn,ghDiwali)>=0) {hs.push("Diwali");}
	// if((mm==7) && (mp==3)) {hs.push("~Diwali");}
	//---------------------------------
	return hs;
}
//----------------------------------------------------------------------------
// DoE : Date of Easter using  "Meeus/Jones/Butcher" algorithm
// Reference: Peter Duffett-Smith, Jonathan Zwart',
//  "Practical Astronomy with your Calculator or Spreadsheet,"
//  4th Etd, Cambridge university press, 2011. Page-4.
// input: (y=year)
// output: (j=julian day number)
// dependency: w2j()
static DoE(y) {
	var a,b,c,d,e,f,g,h,i,k,l,m,p,q,n;
	a=y%19;
	b=Math.floor(y/100); c=y%100;
	d=Math.floor(b/4); e=b%4;
	f=Math.floor((b+8)/25);
	g=Math.floor((b-f+1)/3);
	h=(19*a+b-d-g+15)%30;
	i=Math.floor(c/4); k=c%4;
	l=(32+2*e+2*i-h-k)%7;
	m=Math.floor((a+11*h+22*l)/451);
	q=h+l-7*m+114; p=(q%31)+1; n=Math.floor(q/31);
	return Math.round(ceDateTime.w2j(y,n,p,12,0,0,1));// this is for Gregorian
}
//----------------------------------------------------------------------------
// Get other holidays
// input: (jdn: Julian Day Number)
// output: (array of strings)
// dependency: DoE(), j2w()
static cal_holiday2(jdn) {
	jdn=Math.round(jdn);
	var myt,my,mm,md,mp,mmt,gy,gm,gd;
	var yo=ceMmDateTime.j2m(jdn);
	myt=yo.myt; my=yo.my; mm = yo.mm; md=yo.md;
	mp=ceMmDateTime.cal_mp(md,mm,myt);
	mmt=Math.floor(mm/13); var hs=[];
	var go=ceDateTime.j2w(jdn);
	gy=go.y; gm=go.m; gd=go.d;
	//---------------------------------
	// holidays on gregorian calendar	
	var doe=ceMmDateTime.DoE(gy);
	if((gy<=2017) && (gm==1) && (gd==1)) {hs.push("New Year's Day");}
	else if((gy>=1915) && (gm==2) && (gd==13)) {hs.push("G. Aung San BD");}
	else if((gy>=1969) && (gm==2) && (gd==14)) {hs.push("Valentines Day");}
	else if((gy>=1970) && (gm==4) && (gd==22)) {hs.push("Earth Day");}
	else if((gy>=1392) && (gm==4) && (gd==1)) {hs.push("April Fools' Day");}
	else if((gy>=1948) && (gm==5) && (gd==8)) {hs.push("Red Cross Day");}
	else if((gy>=1994) && (gm==10) && (gd==5)) {hs.push("World Teachers' Day");}
	else if((gy>=1947) && (gm==10) && (gd==24)) {hs.push("United Nations Day");}
	else if((gy>=1753) && (gm==10) && (gd==31)) {hs.push("Halloween");}
	if((gy>=1876) && (jdn==doe)) {hs.push("Easter");}
	else if((gy>=1876) && (jdn==(doe-2))) {hs.push("Good Friday");}
	//---------------------------------
	// holidays on myanmar calendar
	if((my>=1309) && (mm==11) && (md==16))
		{hs.push("Mon National Day");}//the ancient founding of Hanthawady
	else if((mm==9) && (md==1)) {
		hs.push("Shan New Year's Day");
		if(my>=1306) {hs.push("Authors' Day");}
	}//Nadaw waxing moon 1
	else if((mm==3) && (mp==1)) {hs.push("Mahathamaya Day");}//Nayon full moon
	else if((mm==6)&&(mp==1)){hs.push("Garudhamma Day");}//Tawthalin full moon
	else if((my>=1356) && (mm==10) && (mp==1))
		{hs.push("Mothers' Day");}//Pyatho full moon
	else if((my>=1370) && (mm==12) && (mp==1))
		{hs.push("Fathers' Day");}//Tabaung full moon
	else if((mm==5) && (mp==1)) {hs.push("Metta Day");}//Waguang full moon
	else if((mm==5) && (md==10)) {hs.push("Taungpyone Pwe");}//Taung Pyone Pwe
	else if((mm==5) && (md==23)) {hs.push("Yadanagu Pwe");}//Yadanagu Pwe
	//----------------------------------------------------------------------------
	// //other holidays
	// var ghEid2=[2456936,2457290,2457644,2457998,2458353,2458707];
	// var ghCNY=[2456689,2456690,2457073,2457074,2457427,2457428,2457782,
	// 	2457783,2458166,2458167,2458520,2458521];
	// if(ceMmDateTime.bSearch1(jdn,ghEid2)>=0) {hs.push("Eid");}
	// if(ceMmDateTime.bSearch1(jdn,ghCNY)>=0) {hs.push("Chinese New Year's Day");}
	//----------------------------------------------------------------------------
	return hs;
}

//-----------------------------------------------------------------------------
//End of checking holidays ####################################################

//-------------------------------------------------------------------------
// jd to date string in Myanmar calendar 
// input: (jd:julian date,
//  fs: format string [Optional argument: "&y &M &P &ff"]
//  tz : time zone offset in hours (Optional, e.g. 8 for GMT +8))
// output: date string in Myanmar calendar according to fm 
// where formatting strings are as follows
// &yyyy : Myanmar year [0000-9999, e.g. 1380]
// &YYYY : Sasana year [0000-9999, e.g. 2562]
// &y : Myanmar year [0-9999, e.g. 138]
// &mm : month with zero padding [01-14]
// &M : month [e.g. January]
// &m : month [1-14]
// &P : moon phase [e.g. waxing, waning, full moon, or new moon]
// &dd : day of the month with zero padding [01-31]
// &d : day of the month [1-31]
// &ff : fortnight day with zero padding [01-15]
// &f : fortnight day [1-15]
static j2ms(jd,fs="&y &M &P &ff",tz=0)
{	
	jd+=tz/24.0;
	var jdn=Math.round(jd);
	var myt,my,mm,md,mp,mf; 
	var yo=ceMmDateTime.j2m(jdn);
	myt=yo.myt; my=yo.my; mm = yo.mm; md=yo.md;
	mp=ceMmDateTime.cal_mp(md,mm,myt);
	mf=ceMmDateTime.cal_mf(md);
	var mma=["First Waso","Tagu","Kason","Nayon","Waso","Wagaung","Tawthalin",
	"Thadingyut","Tazaungmon","Nadaw","Pyatho","Tabodwe","Tabaung","Late Tagu","Late Kason"];
	var mpa=["Waxing","Full Moon","Waning","New Moon"];
	// replace format string with values
	var fm=fs; var fstr,rstr,re;
	//--------------------------------------------------------
	fstr = "&yyyy"; re = new RegExp(fstr, 'g');
	rstr = "0000" + my.toString(); rstr = rstr.substr(rstr.length - 4); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	var sy=my+1182; //Sasana year
	fstr = "&YYYY"; re = new RegExp(fstr, 'g');
	rstr = "0000" + sy.toString(); rstr = rstr.substr(rstr.length - 4); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&y";  re = new RegExp(fstr, 'g');
	rstr = my.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&mm";  re = new RegExp(fstr, 'g');
	rstr = "00" + mm.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&M";  re = new RegExp(fstr, 'g');
	rstr = mma[mm]; if(mm==4 && myt>0){rstr="Second "+rstr;} fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&m";  re = new RegExp(fstr, 'g');
	rstr = mm.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&P";  re = new RegExp(fstr, 'g');
	rstr = mpa[mp]; fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&dd";  re = new RegExp(fstr, 'g');
	rstr = "00" + md.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&d";  re = new RegExp(fstr, 'g');
	rstr = md.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&ff";  re = new RegExp(fstr, 'g');
	rstr = "00" + mf.toString(); rstr = rstr.substr(rstr.length - 2); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	fstr = "&f";  re = new RegExp(fstr, 'g');
	rstr = mf.toString(); fm = fm.replace(re,rstr);
	//--------------------------------------------------------
	return fm;
}
//-------------------------------------------------------------------------
// get properties

// Myanmar year type
get myt(){ 
	var yo=ceMmDateTime.j2m(this.jdnl);
	return yo.myt;
} 

// Myanmar year
get my(){ 
	var yo=ceMmDateTime.j2m(this.jdnl);
	return yo.my;
} 

// Sasana year
get sy(){ 
	return (this.my+1182);
} 

// Myanmar year name
get my_name(){ 
	// var yna=["ပုဿနှစ်","မာခနှစ်","ဖ္လကိုန်နှစ်","စယ်နှစ်",
	// 	"ပိသျက်နှစ်","စိဿနှစ်","အာသတ်နှစ်","သရဝန်နှစ်",
	// 	"ဘဒြနှစ်","အာသိန်နှစ်","ကြတိုက်နှစ်","မြိက္ကသိုဝ်နှစ်"];
	var yna=["Hpusha","Magha","Phalguni","Chitra",
		"Visakha","Jyeshtha","Ashadha","Sravana",
		"Bhadrapaha","Asvini","Krittika","Mrigasiras"];
	return yna[this.my%12];
} 

// Myanmar month [1-14]
// [Tagu=1, Kason=2, Nayon=3, 1st Waso=0, (2nd) Waso=4, Wagaung=5, 
//  Tawthalin=6, Thadingyut=7, Tazaungmon=8, Nadaw=9, Pyatho=10, Tabodwe=11,  
//  Tabaung=12, Late Tagu=13, Late Kason=14 ]
get mm(){ 
	var yo=ceMmDateTime.j2m(this.jdnl);
	return yo.mm;
} 

// Myanmar day of the month [1-30]
get md(){ 
	var yo=ceMmDateTime.j2m(this.jdnl);
	return yo.md;
} 

// Moon phase [0=waxing, 1=full moon, 2=waning, 3=new moon]
get mp(){ 
	var yo=ceMmDateTime.j2m(this.jdnl);
	return ceMmDateTime.cal_mp(yo.md,yo.mm,yo.myt);
} 

// Fortnight day [1-15]
get mf() {
	return ceMmDateTime.cal_mf(this.md);
}

// get sabbath string
get sabbath() {
	var yo=ceMmDateTime.j2m(this.jdnl);
	var sb=ceMmDateTime.cal_sabbath(yo.md,yo.mm,yo.myt);
	var str="";
	if(sb==1) str="Sabbath";
	else if(sb==2) str="Sabbath Eve";
	return str;
}

// get yatyaza string
get yatyaza() {
	var v=ceMmDateTime.cal_yatyaza(this.mm,this.w);
	return (v?"Yatyaza":"");
}

// get pyathada string
get pyathada() {
	var v=ceMmDateTime.cal_pyathada(this.mm,this.w);
	var pa=["","Pyathada","Afternoon Pyathada"];
	return pa[v%3];
}

// get nagahle direction
get nagahle() {
	var v=ceMmDateTime.cal_nagahle(this.mm);
	var pa=["West","North","East","South"];
	return pa[v%4];
}

// get mahabote direction
get mahabote() {
	var v=ceMmDateTime.cal_mahabote(this.my,this.w);
	var pa=["Binga","Atun","Yaza","Adipati","Marana","Thike","Puti"];
	return pa[v%7];
}

// get the array of astrological days
get astro() {
	return ceMmDateTime.cal_astro(this.jdnl);
}

// get the array of public holidays
get holidays() {
	return ceMmDateTime.cal_holiday(this.jdnl);
}

// get the array of other holidays
get holidays2() {
	return ceMmDateTime.cal_holiday2(this.jdnl);
}

//-------------------------------------------------------------------------
// get Myanmar Date String
// input: (
//  fs: format string [Optional argument: "&yyyy &M &P &ff"]
//  tz : time zone offset in hours (Optional, e.g. 8 for GMT +8))
// output: date string in Myanmar calendar according to fm 
// where formatting strings are as follows
// &yyyy : Myanmar year [0000-9999, e.g. 1380]
// &YYYY : Sasana year [0000-9999, e.g. 2562]
// &mm : month with zero padding [01-14]
// &M : month [e.g. January]
// &m : month [1-14]
// &P : moon phase [e.g. waxing, waning, full moon, or new moon]
// &dd : day of the month with zero padding [01-31]
// &d : day of the month [1-31]
// &ff : fortnight day with zero padding [01-15]
// &f : fortnight day [1-15]
ToMString(fs="&yyyy &M &P &ff") {
	return ceMmDateTime.j2ms(this.jd,fs,this.tz);
}

} //ceMmDateTime

//-----------------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//-----------------------------------------------------------------------
//Start of chronicle ####################################################
//-----------------------------------------------------------------------

class ceMmTranslate {
	//-------------------------------------------------------------------------
	constructor() {
		this.m_lang=ceMmTranslate.Init();
	}
//-----------------------------------------------------------------------------
// Translate
// inputs ( str = string to translate,
//    toLn = to language number [optional: 1]
//    fromLn = from language number [optional: 0],)
// Language number: 0: English, 1: Myanmar (Unicode), 2: Zawgyi, 
//		3: Mon, 4: Shan, 5: Karen
T(str,toLn=1,fromLn=0) {
	var i; var l=this.m_lang.length;
	var fstr,rstr,re;
	for(i=0;i<l;i++){
		fstr = this.m_lang[i][fromLn];  re = new RegExp(fstr, 'g');
		rstr = this.m_lang[i][toLn]; str = str.replace(re,rstr);
	}
	return str;
}
//-----------------------------------------------------------------------------
// Initialize the language catalog with 2 dimensional array
// Index 0: English, 1: Myanmar (Unicode), 2: Zawgyi, 
//		3: Mon, 4: Shan, 5: Karen
//Credit: Mon Language Translation by 'ITVilla' : http://it-villa.blogspot.com/
//and Proof reading by Mikau Nyan
static Init() {
	return [
		["0","၀","၀","၀","၀","၀"],
		["1","၁","၁","၁","၁","၁"],
		["2","၂","၂","၂","၂","၂"],
		["3","၃","၃","၃","၃","၃"],
		["4","၄","၄","၄","၄","၄"],
		["5","၅","၅","၅","၅","၅"],
		["6","၆","၆","၆","၆","၆"],
		["7","၇","၇","၇","၇","၇"],
		["8","၈","၈","၈","၈","၈"],
		["9","၉","၉","၉","၉","၉"],
		["January","ဇန်နဝါရီ","ဇန္နဝါရီ","ဂျာန်နျူအာရဳ","ဇန်နဝါရီ","ဇန်နဝါရီ"],
		["February","ဖေဖော်ဝါရီ","ေဖေဖာ္ဝါရီ","ဝှေဝ်ဗျူအာရဳ","ဖေဖော်ဝါရီ","ဖေဖော်ဝါရီ"],
		["March","မတ်","မတ္","မာတ်ချ်","မတ်","မတ်"],
		["April","ဧပြီ","ဧၿပီ","ဨပြေယ်လ်","ဧပြီ","ဧပြီ"],
		["May","မေ","ေမ","မေ","မေ","မေ"],
		["June","ဇွန်","ဇြန္","ဂျုန်","ဇွန်","ဇွန်"],
		["July","ဇူလိုင်","ဇူလိုင္","ဂျူလာၚ်","ဇူလိုင်","ဇူလိုင်"],
		["August","ဩဂုတ်","ဩဂုတ္","အဝ်ဂါတ်","ဩဂုတ်","ဩဂုတ်"],
		["September","စက်တင်ဘာ","စက္တင္ဘာ","သိတ်ထီဗာ","စက်တင်ဘာ","စက်တင်ဘာ"],
		["October","အောက်တိုဘာ","ေအာက္တိုဘာ","အံက်ထဝ်ဗာ","အောက်တိုဘာ","အောက်တိုဘာ"],
		["November","နိုဝင်ဘာ","နိုဝင္ဘာ","နဝ်ဝါမ်ဗာ","နိုဝင်ဘာ","နိုဝင်ဘာ"],		
		["December","ဒီဇင်ဘာ","ဒီဇင္ဘာ","ဒီဇြေန်ဗာ","ဒီဇင်ဘာ","ဒီဇင်ဘာ"],		
		["Tagu","တန်ခူး","တန္ခူး","ဂိတုစဲ","တန်ခူး","တန်ခူး"],
		["Kason","ကဆုန်","ကဆုန္","ဂိတုပသာ်","ကဆုန်","ကဆုန်"],
		["Nayon","နယုန်","နယုန္","ဂိတုဇှေ်","နယုန်","နယုန်"],
		["Waso","ဝါဆို","ဝါဆို","ဂိတုဒ္ဂိုန်","ဝါဆို","ဝါဆို"],
		["Wagaung","ဝါခေါင်","ဝါေခါင္","ဂိတုခ္ဍဲသဳ","ဝါခေါင်","ဝါခေါင်"],
		["Tawthalin","တော်သလင်း","ေတာ္သလင္း","ဂိတုဘတ်","တော်သလင်း","တော်သလင်း"],
		["Thadingyut","သီတင်းကျွတ်","သီတင္းကြ်တ္","ဂိတုဝှ်","သီတင်းကျွတ်","သီတင်းကျွတ်"],
		["Tazaungmon","တန်ဆောင်မုန်း","တန္ေဆာင္မုန္း","ဂိတုက္ထိုန်","တန်ဆောင်မုန်း","တန်ဆောင်မုန်း"],
		["Nadaw","နတ်တော်","နတ္ေတာ္","ဂိတုမြေက္ကသဵု","နတ်တော်","နတ်တော်"],
		["Pyatho","ပြာသို","ျပာသို","ဂိတုပှော်","ပြာသို","ပြာသို"],
		["Tabodwe","တပို့တွဲ","တပို႔တြဲ","ဂိတုမာ်","တပို့တွဲ","တပို့တွဲ"],
		["Tabaung","တပေါင်း","တေပါင္း","ဂိတုဖဝ်ရဂိုန်","တပေါင်း","တပေါင်း"],		
		["First","ပ","ပ","ပ","ပ","ပ"],
		["Second","ဒု","ဒု","ဒု","ဒု","ဒု"],
		["Late","နှောင်း","ေႏွာင္း","နှောင်း","နှောင်း","နှောင်း"],
		["Waxing","လဆန်း","လဆန္း","မံက်","လဆန်း","လဆန်း"],
		["Waning","လဆုတ်","လဆုတ္","စွေက်","လဆုတ်","လဆုတ်"],
		["Full Moon","လပြည့်","လျပည့္","ပေၚ်","လပြည့်","လပြည့်"],
		["New Moon","လကွယ်","လကြယ္","အိုတ်","လကွယ်","လကွယ်"],
		["Myanmar","မြန်မာ","ျမန္မာ","ဍုၚ်","မြန်မာ","မြန်မာ"],		
		["Good Friday","သောကြာနေ့ကြီး","ေသာၾကာေန႔ႀကီး","သောကြာနေ့ကြီး","သောကြာနေ့ကြီး","သောကြာနေ့ကြီး"],
		["Sunday","တနင်္ဂနွေ","တနဂၤေႏြ","တ္ၚဲအဒိုတ်","တနင်္ဂနွေ","တနင်္ဂနွေ"],
		["Monday","တနင်္လာ","တနလၤာ","တ္ၚဲစန်","တနင်္လာ","တနင်္လာ"],
		["Tuesday","အင်္ဂါ","အဂၤါ","တ္ၚဲအင္ၚာ","အင်္ဂါ","အင်္ဂါ"],
		["Wednesday","ဗုဒ္ဓဟူး","ဗုဒၶဟူး","တ္ၚဲဗုဒ္ဓဝါ","ဗုဒ္ဓဟူး","ဗုဒ္ဓဟူး"],
		["Thursday","ကြာသပတေး","ၾကာသပေတး","တ္ၚဲဗြဴဗတိ","ကြာသပတေး","ကြာသပတေး"],		
		["Friday","သောကြာ","ေသာၾကာ","သောကြာ","တ္ၚဲသိုက်","သောကြာ"],
		["Saturday","စနေ","စေန","တ္ၚဲသ္ၚိသဝ်","စနေ","စနေ"],		
		["Sabbath Eve","အဖိတ်","အဖိတ္","တ္ၚဲတိၚ်","အဖိတ်","အဖိတ်"],
		["Sabbath","ဥပုသ်","ဥပုသ္","တ္ၚဲသဳ","ဥပုသ်","ဥပုသ်"],
		["Yatyaza","ရက်ရာဇာ","ရက္ရာဇာ","တ္ၚဲရာဇာ","ရက်ရာဇာ","ရက်ရာဇာ"],
		["Pyathada","ပြဿဒါး","ျပႆဒါး","တ္ၚဲပြာဗ္ဗဒါ","ပြဿဒါး","ပြဿဒါး"],
		["Afternoon","မွန်းလွဲ","မြန္းလြဲ","မွန်းလွဲ","မွန်းလွဲ","မွန်းလွဲ"],
		["New Year's","နှစ်ဆန်း","ႏွစ္ဆန္း","လှာဲသၞာံ","နှစ်ဆန်း","နှစ်ဆန်း"],
		["Independence","လွတ်လပ်ရေး","လြတ္လပ္ေရး","သၠးပွး","လွတ်လပ်ရေး","လွတ်လပ်ရေး"],
		["Union","ပြည်ထောင်စု","ျပည္ေထာင္စု","ကၟိန်ဍုၚ်","ပြည်ထောင်စု","ပြည်ထောင်စု"],
		["Peasants'","တောင်သူလယ်သမား","ေတာင္သူလယ္သမား","သၟာဗ္ၚ","တောင်သူလယ်သမား","တောင်သူလယ်သမား"],
		["Resistance","တော်လှန်ရေး","ေတာ္လွန္ေရး","ပၠန်ဂတးဗၟာ","တော်လှန်ရေး","တော်လှန်ရေး"],
		["Labour","အလုပ်သမား","အလုပ္သမား","သၟာကမၠောန်","အလုပ်သမား","အလုပ်သမား"],
		["Martyrs'","အာဇာနည်","အာဇာနည္","အာဇာနဲ","အာဇာနည်","အာဇာနည်"],
		["Christmas","ခရစ္စမတ်","ခရစၥမတ္","ခရေဿမာတ်","ခရစ္စမတ်","ခရစ္စမတ်"],
		["Buddha","ဗုဒ္ဓ","ဗုဒၶ","သ္ဘၚ်ဖဍာ်ဇြဲ","ဗုဒ္ဓ","ဗုဒ္ဓ"],
		["Start of Buddhist Lent","ဓမ္မစကြာနေ့","ဓမၼစၾကာေန႔","တ္ၚဲတွံဓဝ်ဓမ္မစက်","ဓမ္မစကြာနေ့","ဓမ္မစကြာနေ့"],
		["End of Buddhist Lent","မီးထွန်းပွဲ","မီးထြန္းပြဲ","တ္ၚဲအဘိဓရ်","မီးထွန်းပွဲ","မီးထွန်းပွဲ"],
		["Tazaungdaing","တန်ဆောင်တိုင်","တန္ေဆာင္တိုင္","သ္ဘၚ်ပူဇဴပၟတ်ပၞာၚ်","တန်ဆောင်တိုင်","တန်ဆောင်တိုင်"],
		["National","အမျိုးသား","အမ်ိဳးသား","ကောန်ဂကူဗၟာ","အမျိုးသား","အမျိုးသား"],
		["Karen","ကရင်","ကရင္","ကရေၚ်","ကရင်","ကရင်"],
		["Pwe","ပွဲ","ပြဲ","သ္ဘၚ်","ပွဲ","ပွဲ"],
		["Thingyan","သင်္ကြန်","သၾကၤန္","အတး","သင်္ကြန်","သင်္ကြန်"],
		["Akyo","အကြို","အႀကိဳ","ဒစး","အကြို","အကြို"],
		["Akya","အကျ","အက်","စှေ်","အကျ","အကျ"],
		["Akyat","အကြတ်","အၾကတ္","ကြာပ်","အကြတ်","အကြတ်"],
		["Atat","အတက်","အတက္","တိုန်","အတက်","အတက်"],
		["Amyeittasote","အမြိတ္တစုတ်","အၿမိတၱစုတ္","ကိုန်အမြိုတ်","အမြိတ္တစုတ်","အမြိတ္တစုတ်"],
		["Warameittugyi","ဝါရမိတ္တုကြီး","ဝါရမိတၱဳႀကီး","ကိုန်ဝါရမိတ္တုဇၞော်","ဝါရမိတ္တုကြီး","ဝါရမိတ္တုကြီး"],
		["Warameittunge","ဝါရမိတ္တုငယ်","ဝါရမိတၱဳငယ္","ကိုန်ဝါရမိတ္တုဍောတ်","ဝါရမိတ္တုငယ်","ဝါရမိတ္တုငယ်"],
		["Thamaphyu","သမားဖြူ","သမားျဖဴ","ကိုန်လေၚ်ဒိုက်","သမားဖြူ","သမားဖြူ"],
		["Thamanyo","သမားညို","သမားညိဳ","ကိုန်ဟုံဗြမ်","သမားညို","သမားညို"],
		["Yatpote","ရက်ပုပ်","ရက္ပုပ္","ကိုန်လီုလာ်","ရက်ပုပ်","ရက်ပုပ်"],
		["Yatyotema","ရက်ယုတ်မာ","ရက္ယုတ္မာ","ကိုန်ယုတ်မာ","ရက်ယုတ်မာ","ရက်ယုတ်မာ"],
		["Mahayatkyan","မဟာရက်ကြမ်း","မဟာရက္ၾကမ္း","ကိုန်ဟွံခိုဟ်","မဟာရက်ကြမ်း","မဟာရက်ကြမ်း"],
		["Nagapor","နဂါးပေါ်","နဂါးေပၚ","နာ်မံက်","နဂါးပေါ်","နဂါးပေါ်"],
		["Shanyat","ရှမ်းရက်","ရွမ္းရက္","တ္ၚဲဒတန်","ရှမ်းရက်","ရှမ်းရက်"],			
		["Mon","မွန်","မြန္","ပၠန်","မွန်","မွန်"],
		["G. Aung San BD","ဗိုလ်ချုပ်မွေးနေ့","ဗိုလ္ခ်ဳပ္ေမြးေန႔","တ္ၚဲသၟိၚ်ဗၟာ အံၚ်သာန်ဒှ်မၞိဟ်","ဗိုလ်ချုပ်မွေးနေ့","ဗိုလ်ချုပ်မွေးနေ့"],
		["Valentines","ချစ်သူများ","ခ်စ္သူမ်ား","ဝုတ်ဗၠာဲ","ချစ်သူများ","ချစ်သူများ"],
		["Earth","ကမ္ဘာမြေ","ကမၻာေျမ","ဂၠးကဝ်","ကမ္ဘာမြေ","ကမ္ဘာမြေ"],
		["April Fools'","ဧပြီအရူး","ဧၿပီအ႐ူး","သ္ပပရအ်","ဧပြီအရူး","ဧပြီအရူး"],
		["Red Cross","ကြက်ခြေနီ","ၾကက္ေျခနီ","ဇိုၚ်ခ္ဍာ်ဍာဲ","ကြက်ခြေနီ","ကြက်ခြေနီ"],
		["United Nations","ကုလသမ္မဂ္ဂ","ကုလသမၼဂၢ","ကုလသမ္မဂ္ဂ","ကုလသမ္မဂ္ဂ","ကုလသမ္မဂ္ဂ"],
		["Halloween","သရဲနေ့","သရဲေန႔","ဟေဝ်လဝ်ဝိန်","သရဲနေ့","သရဲနေ့"],
		["Shan","ရှမ်း","ရွမ္း","သေံ","ရှမ်း","ရှမ်း"],
		["Mothers'","အမေများ","အေမမ်ား","မိအံက်","အမေများ","အမေများ"],
		["Fathers'","အဖေများ","အေဖမ်ား","မအံက်","အဖေများ","အဖေများ"],
		["Sasana","သာသနာ","သာသနာ","သာသနာ","သာသနာ","သာသနာ"],
		["Eid","အိဒ်","အိဒ္","အိဒ်","အိဒ်","အိဒ်"],
		["Diwali","ဒီဝါလီ","ဒီဝါလီ","ဒီဝါလီ","ဒီဝါလီ","ဒီဝါလီ"],
		["Mahathamaya","မဟာသမယ","မဟာသမယ","မဟာသမယ","မဟာသမယ","မဟာသမယ"],
		["Garudhamma","ဂရုဓမ္မ","ဂ႐ုဓမၼ","ဂရုဓမ္မ","ဂရုဓမ္မ","ဂရုဓမ္မ"],
		["Metta","မေတ္တာ","ေမတၱာ","မေတ္တာ","မေတ္တာ","မေတ္တာ"],
		["Taungpyone","တောင်ပြုန်း","ေတာင္ျပဳန္း","တောင်ပြုန်း","တောင်ပြုန်း","တောင်ပြုန်း"],
		["Yadanagu","ရတနာ့ဂူ","ရတနာ့ဂူ","ရတနာ့ဂူ","ရတနာ့ဂူ","ရတနာ့ဂူ"],
		["Authors'","စာဆိုတော်","စာဆိုေတာ္","စာဆိုတော်","စာဆိုတော်","စာဆိုတော်"],
		["World","ကမ္ဘာ့","ကမၻာ့","ကမ္ဘာ့","ကမ္ဘာ့","ကမ္ဘာ့"],
		["Teachers'","ဆရာများ","ဆရာမ်ား","ဆရာများ","ဆရာများ","ဆရာများ"],
		["Holiday","ရုံးပိတ်ရက်","႐ုံးပိတ္ရက္","ရုံးပိတ်ရက်","ရုံးပိတ်ရက်","ရုံးပိတ်ရက်"],
		["Chinese","တရုတ်","တ႐ုတ္","တရုတ်","တရုတ်","တရုတ်"],
		["Easter","ထမြောက်ရာနေ့","ထေျမာက္ရာေန႔","ထမြောက်ရာနေ့","ထမြောက်ရာနေ့","ထမြောက်ရာနေ့"], 
		["Nay","နေ့","ေန႔","တ္ၚဲ","နေ့","နေ့"],
		["Day","နေ့","ေန႔","တ္ၚဲ","နေ့","နေ့"],
		["Yat","ရက်","ရက္","ရက်","ရက်","ရက်"],
		["Year","နှစ်","ႏွစ္","နှစ်","နှစ်","နှစ်"],
		["Ku","ခု","ခု","သၞာံ","ခု","ခု"],
		["Naga","နဂါး","နဂါး","နဂါး","နဂါး","နဂါး"],
		["Head","ခေါင်း","ေခါင္း","ခေါင်း","ခေါင်း","ခေါင်း"],
		["Facing","လှည့်","လွည့္","လှည့်","လှည့်","လှည့်"],
		["East","အရှေ့","အေရွ႕","အရှေ့","အရှေ့","အရှေ့"],
		["West","အနောက်","အေနာက္","အနောက်","အနောက်","အနောက်"],
		["South","တောင်","ေတာင္","တောင်","တောင်","တောင်"],
		["North","မြောက်","ေျမာက္","မြောက်","မြောက်","မြောက်"],
		["Mahabote","မဟာဘုတ်","မဟာဘုတ္","မဟာဘုတ်","မဟာဘုတ်","မဟာဘုတ်"],
		["Born","ဖွား","ဖြား","ဖွား","ဖွား","ဖွား"],
		["Binga","ဘင်္ဂ","ဘဂၤ","ဘင်္ဂ","ဘင်္ဂ","ဘင်္ဂ"],
		["Atun","အထွန်း","အထြန္း","အထွန်း","အထွန်း","အထွန်း"],
		["Yaza","ရာဇ","ရာဇ","ရာဇ","ရာဇ","ရာဇ"],
		["Adipati","အဓိပတိ","အဓိပတိ","အဓိပတိ","အဓိပတိ","အဓိပတိ"],
		["Marana","မရဏ","မရဏ","မရဏ","မရဏ","မရဏ"],
		["Thike","သိုက်","သိုက္","သိုက်","သိုက်","သိုက်"],
		["Puti","ပုတိ","ပုတိ","ပုတိ","ပုတိ","ပုတိ"],
		["Hpusha","ပုဿ","ပုႆ","ပုဿ","ပုဿ","ပုဿ"],
		["Magha","မာခ","မာခ","မာခ","မာခ","မာခ"],
		["Phalguni","ဖ္လကိုန်","ဖႅကိုန္","ဖ္လကိုန်","ဖ္လကိုန်","ဖ္လကိုန်"],
		["Chitra","စယ်","စယ္","စယ်","စယ်","စယ်"],
		["Visakha","ပိသျက်","ပိသ်က္","ပိသျက်","ပိသျက်","ပိသျက်"],
		["Jyeshtha","စိဿ","စိႆ","စိဿ","စိဿ","စိဿ"],
		["Ashadha","အာသတ်","အာသတ္","အာသတ်","အာသတ်","အာသတ်"],
		["Sravana","သရဝန်","သရဝန္","သရဝန်","သရဝန်","သရဝန်"],
		["Bhadrapaha","ဘဒြ","ဘျဒ","ဘဒြ","ဘဒြ","ဘဒြ"],
		["Asvini","အာသိန်","အာသိန္","အာသိန်","အာသိန်","အာသိန်"],
		["Krittika","ကြတိုက်","ၾကတိုက္","ကြတိုက်","ကြတိုက်","ကြတိုက်"],
		["Mrigasiras","မြိက္ကသိုဝ်","ၿမိကၠသိုဝ္","မြိက္ကသိုဝ်","မြိက္ကသိုဝ်"],
		//[".","။","။","။","။","။"],
		//[",","၊","၊","၊","၊","၊"],	
	];
}
//-----------------------------------------------------------------------------

} //ceMmTranslate
//-----------------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//-----------------------------------------------------------------------
//Start of chronicle ####################################################
//-----------------------------------------------------------------------

class ceMmChronicle {
	//-------------------------------------------------------------------------
	constructor() {
		this.m_ev=ceMmChronicle.Init();
	}
//-----------------------------------------------------------------------------	
// get chronicle evidence
chronicle(jdn) {
	var str=""; var i=this.hSearch(jdn);
	if(i>=0){ str=this.m_ev[i]["Description"];}
	return str;
}
//-----------------------------------------------------------------------------
//Search jd in chronicle 
//input: (jdn=Julian day number)
//output: (i= index)
hSearch(jdn)
{
	var i=0; var l=0; var u=this.m_ev.length-1;
	while(u>=l) {
		i = Math.floor((l+u)/2); // calculate midpoint
		if (this.m_ev[i]["Julian Day Number"]<jdn) l=i+1;
		else if (this.m_ev[i]["Julian Day Number"]>jdn)  u=i-1;
        else { return i; }// found
    }
	return -1;//not found
}
//-----------------------------------------------------------------------------
static Init() {
	return [
	{
		"Julian Day Number":1995076,
		"Myanmar Year":111,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Sunday",
		"Description":"Foundation of Arimaddana."
	},
	{
		"Julian Day Number":2031512,
		"Myanmar Year":211,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Monday",
		"Description":"Foundation of Pagan."
	},
	{
		"Julian Day Number":2107906,
		"Myanmar Year":420,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"ဂဝံကျောင်း ကျောက်စာ၊ လက်သည်းရှည်ဘုရား၊ ပုဂံမြို့၊ အနော်ရထာမင်းကြီး။ ကျောင်းပြု၍ ဆင်၊ မြင်း၊ လယ်၊ မြေလှူဒါန်း။ သကရစ် ၄၂၀ ဘဿနှစ် တပေါင်လ္ဆန် ၅ ရက် ၅ နိယ်လျှင် ဘုန်တန်ခိုဝ် ပ္လည်ာနှင် ပ္လည်စုံမ်စွာသော စ်အနောရဓါ မင်ကြီကာ ၁ သူမ္လင် လောက် အဓုံမ်ကိုဝ် ယရုယ် သ္ခိင်ကဝံ ထု၏ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၁၀။"
	},
	{
		"Julian Day Number":2125483,
		"Myanmar Year":469,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Thursday",
		"Description":"ပရိမ္မထီးလိုင်သျှင်ဘုရားကျောက်စာ၊ ထီးလှိုင်ရှင်ဘုရား၊ ပရိမ္မရွာ၊ မြောင်မြို့နယ်၊ စေတီတည်၍၊ ကျွန်၊ စပါး၊ ငရုတ်၊ ချင်း၊ ဆား၊ ငါးပိ စသည်လှူဒါန်း။ သကရဇ် ၄၆၉ ခူ မာဃ ဂံဝဇ္ဆိုဏ် သိရိ ဘဝနာ ဒိတျ ဝံင်္သ ရာဇာဓိ ရာဇာ။ မဟ ဗ္ဗလော ဇိနိတွာန ၊ မဟိံ သဗ္ဗံ နိဗာနံ သမ္ပတာရ ယန္တိ ။ ကုဆုန်လ္ဆန် ၁၀ ၅ နိယ် မိမိဖွာရာ ပရိမ်ပြည်နှိုက် ဓိလိုင်သျင် မင်ကြီ စေတီ တည်၏ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅ (က)။"
	},
	{
		"Julian Day Number":2127136,
		"Myanmar Year":473,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Friday",
		"Description":"လှည်းထောင်ဘုရားကျောက်စာ၊ တောင်ပြုန်းကြီး၊ အလောင်းစည်သူမင်းကြီး။ ဘုရားတည်ကျောင်းပြု၍ မြေလှူဒါန်း။ သက္ကရာစ် ၄၇၃ ခု တန်စောင်မုန် လဆန် ဆဲရက် သောက်ကြာ နံနက် သရဝန် နက်သတ် နှစ်ဆဲ နှစ်လုံမ်လျှင် ပ္လုတဝ်မူ၏ ၊ ငါပ္လုသော ဖုရာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၄ (က)။"
	},
	{
	  "Julian Day Number":2149217,
	  "Myanmar Year":534,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":2,
	  "Day of the Week":"Monday",
	  "Description":"၅၃၄ (*၅၃၉) ခု ။ ကုဆုန်လ္ဆန် ၂ ရျက် တနှင်လာညန် သန်ကောင်လွန်ပေသော ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် (၇၈-က)။"
	 },
	{
		"Julian Day Number":2150320,
		"Myanmar Year":537,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Friday",
		"Description":"သင်ကြီးငါယန်သင် ကျောက်စာ။ သိမ်နှင့်ပုထိုးပြု၍ ကျွန်၊ လယ်၊ ယာ၊ နွား၊ စသည့် လှူဒါန်း။ ... သကရစ် (၅၃) ၇ ခု ကြတီုက်နှစ် ကူဆူန်လ္ဆန် ၁၀ ရျာက် သုက္ကြာနိယ္အ်အာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၃။ (ကြတိုက်နှစ်ဆိုပါက ၅၃၈ ဖြစ်သင့်သည်။)"
	}, 	
	{ 
	  "Julian Day Number":2152069, 
	  "Myanmar Year":541, 
	  "Myanmar Month":"Tabodwe", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Friday", 
	  "Description":"ကျစွာမင် မိထွေးတော်ကျောင်း ကျောက်စာ။ သကရစ် ၅၄၁ ခု။ မာဃနှစ်။ တပိုဝ်ထွယ်လ္ဆုတ် (၅ ရျ)က်။ ၆ နိယ် သင်ကြီ ငထာသင်... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၈။" 
	 },
	{
		"Julian Day Number":2152959,
		"Myanmar Year":544,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Friday",
		"Description":"အိုနူသင် ကျောက်စာ၊ ကျွန် လှူဒါန်း။ သကရစ် ၅၄၄ ခု ဗိသျက်နှစ် မ္လယ်တာလဆုတ် ၇ ရျာက် သုကြာနိ ဖုန်အသည် ကြိယ် အိုနူသင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၁။"
	},
	{
	  "Julian Day Number":2153441,
	  "Myanmar Year":545,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":3,
	  "Day of the Week":"Thursday",
	  "Description":"စည်သူမင်းကြီး ကျောက်စာ။  သက္ကရစ် ၅၄၅ ခု စိသ နှစ် တန်ဆောင်မုန် လ္ဆန် ၃ ရျက် ကြာသပတေနိယ္အ်အာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၄ (ခ)။"
	 },
	{
		"Julian Day Number":2153574,
		"Myanmar Year":545,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"ပရိမ္မထီးလိုင်သျှင်ဘုရားကျောက်စာ၊ ထီးလှိုင်ရှင်ဘုရား၊ ပရိမ္မရွာ၊ မြောင်မြို့နယ်၊ အလောင်းစည်သူမင်းကြီး။ ဂူ ဘုရားပြု၍ လယ်မြေလှူဒါန်း။ သက္ကစ် ၅၄၅ ခု စိတ်သနှစ် တပေါင်လ္ဆုတ် ၅ ရျက် ၅ နိယ်လျှင် နတ်ရွာသဖွယ် ဖ္လစ်သော ပရိမ်မည်သပြည်နှိုက် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅ (ခ)။"
	},
	{
	  "Julian Day Number":2157668,
	  "Myanmar Year":557,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":7,
	  "Day of the Week":"Wednesday",
	  "Description":"သူကြွယ်ကျောင်း ကျောက်စာ။ သက္ကရစ် ၅၅၇ ခု နံယုံလ္ဆန် ၇ ရျက် ၄ နေ့လျှင်  ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၉၀။"
	 },
	{
		"Julian Day Number":2158888,
		"Myanmar Year":560,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Friday",
		"Description":"မောင်းမ စောခင်မိငယ် ကျောက်စာ။ ဓမ္မရာဇိကဘုရား၊ ပုဂံမြို့။ လှူဒါန်း။ သကရစ် ၅၆၀ ဖဿနှစ် သန္တူလ္ဆုတ် ၂ ရျက် သုကြာနိယ် မောင်မ ခင်မိငယ် ဖုရှာ လှူသော တန်ရောက်လယ် ၅၀ လှူ၏ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၃၇။ <br/><br/> ပုဂံ ရွှေကျာင်း အရှေ့ဂူ ကျောက်စာ။  သကရစ် ၅၆၀ ဖဿနှစ် သန္တူလ္ဆုတ် ၂ ရျက် သောကြာနိယ်အာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၇။"
	},
	{
		"Julian Day Number":2159759,
		"Myanmar Year":562,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Monday",
		"Description":"စည်သူမင်းကြီး ကျောက်စာ၊ စည်သူမင်းကြီးလင်မယား။ ပုထိုး၊ ဂူ၊ တံတိုင်းပြု၍ ကျွန်၊ လယ် စသည်လှူဒါန်း။ သက္ကရစ် ၅၆၂ ခု ကြတိုက်နှစ် တပေါင်လ္ဆုန် ၅ ရျက် ၂ နိယ် သစ်မတီအရပ်နှိုက် စည်သူမင်ကြီသည် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၃။"
	},
	{
		"Julian Day Number":2161311,
		"Myanmar Year":567,
		"Myanmar Month":"Kason",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"သင်ငါနှစ်လို့သင် ကျောက်စာ၊ သင်ငါနှစ်လို့သင်။ ဂူဘုရားအားကျွန်၊ နွား၊ လယ် စသည်လှူဒါန်း။ မ္လတ်စွာသော ပုရှာသ္ခိင် သာသနာ လွန်လိယ်ပြီသော အနှစ် ၁၇၅၀ သကရစ် ၅၆၇ စေယ်နှစ် ။ ကုဆုန်လ ပ္လည် စနိယ်နိယ်အာ သင်ငါနှစ်လိုဝ္အ်သင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၄ (က ၊ ခ)။ ( က ရှိ ၅၆၇ မှာ သာသနာနှစ်နှင့် မကိုက်ပဲ ခ ရှိ ၅၆၈ မှာကိုက်ညီသည်။ သို့သော် စေယ်နှစ်ဆိုပါက က ရှိ ၅၆၇ မှာကိုက်ညီသည်။ မောင်းမ စောခင်မိငယ် ကျောက်စာ အရ ၅၆၈ ကဆုန်လပြည့်မှာ ဗုဒ္ဓဟူးဖြစ်သဖြင့်၊ ဤ ခုနှစ်မှာ ၅၆၇ ဟု ယူဆရသည်။)"
	},
	{
		"Julian Day Number":2161665,
		"Myanmar Year":568,
		"Myanmar Month":"Kason",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Wednesday",
		"Description":"မောင်းမ စောခင်မိငယ် ကျောက်စာ။ ဓမ္မရာဇိကဘုရား၊ ပုဂံမြို့။ လှူဒါန်း။ သကရစ် ၅၆၈ ခု ပိသျက်နှစ် ကဆုန်လပ္လည် ပုတ္တဟူနိယ် မောင်မ စဝ်ခင်မိငယ် ဖုရှာကိုဝ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၃၇။"
	}, 	
	{ 
	  "Julian Day Number":2162746, 
	  "Myanmar Year":571, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":7, 
	  "Day of the Week":"Thursday", 
	  "Description":"မင်းမတ်နဂါပိုရ်မိဖွါးကျောက်စာ။ သကရစ် ၅၇၁ ခု အာသိန်နှစ်၊ ကုဆုန်လ္ဆန် ၇ ရျက် ၅ နိယ်အာ၊ မင်မတ် နဂါပိုရ် မိဖွါ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၃။  " 
	 },
	{
		"Julian Day Number":2163605,
		"Myanmar Year":573,
		"Myanmar Month":"Tawthalin",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Thursday",
		"Description":"Htilominlo comes to power."
	},
	{
		"Julian Day Number":2169199,
		"Myanmar Year":588,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"ဖျက္ကသု ကျောက်စာ။ ဖျက္ကသုမင်း။ လယ်၊ မြေ လှူဒါန်း။ သာကရစ် ၅၈၈ ခု ပုဿနှစ် နတ္တဝ်လဆု . ၅ သုကြာနိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၉။"
	}, 	 	 	
	{ 
	  "Julian Day Number":2170481, 
	  "Myanmar Year":592, 
	  "Myanmar Month":"Waso", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Saturday", 
	  "Description":"မကွေးသူ မုဆိုးမ ကျောက်စာ။ သကရစ် ၅၉၂ ခု ဖ္လကိုန်  မ္လွယ်တာလဆန် ၅ ရျက် စနိယ်နိယ်အာ ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁၈။" 
	 },
	{ 
	  "Julian Day Number":2171439, 
	  "Myanmar Year":594, 
	  "Myanmar Month":"Tabodwe", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":2, 
	  "Day of the Week":"Friday", 
	  "Description":"အမတ်အစလပိဇည်တို့ကျောက်စာ။ သကရစ် ၅၉၄ ခု တပိုဝ်ထွယ် လဆု ၂ င်္ရျ သုကြနိ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၉။  " 
	 },
	{ 
	  "Julian Day Number":2172263, 
	  "Myanmar Year":597, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Wednesday", 
	  "Description":"သူကြွယ်ငါစပါသင် ကျောက်စာ။ သကရစ် ၅၉၇ ခုကုဆုန် လပ္လည္အ် ပုတ္တဟောနိယ္အ် သုကြွယ် ငါစပါသင် ...။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၈၉(က)။" 
	 },
	{
		"Julian Day Number":2172725,
		"Myanmar Year":598,
		"Myanmar Month":"Tawthalin",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"သိရိတရိဘဝနာတိတျပဝရ မဟာ ဓမ္မရာဇာ စေည်ု။ ဘုရားတည်၊ ကျောင်းဆောက်၍၊ လယ်၊ မြေ လှူဒါန်း။ သက္ကရာဇ် ၅၉၈ ကြတိုက်နှစ် တော်သလင်လဆန် ၇ ရက် ဗုဒ္ဓဟုနိယ်၊ သိရိ တရိ ဘဝနာ တိတျ ပဝရ မဟာဓမ္မရာဇာ စေည်ု အမည်တော်ဟိသော ဖုရာဆုတောင်သော ၊ မင်မြတ်သှ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၈။"
	}, 	
	{ 
	  "Julian Day Number":2173332, 
	  "Myanmar Year":600, 
	  "Myanmar Month":"Tagu", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Monday", 
	  "Description":"မဟာဂေါတမဘုရားကျောက်စာ။ သကရစ် ၆၀၀ ပုဿနှစ် တန်ခူလ္ဆုတ် ၅ ရျက် တနှင်လာနိယ်... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁။  " 
	 }, 	
	{ 
	  "Julian Day Number":2173680, 
	  "Myanmar Year":601, 
	  "Myanmar Month":"Tagu", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":2, 
	  "Day of the Week":"Saturday", 
	  "Description":"အမတ်အစလပိဇည်တို့ကျောက်စာ။ သကရစ် ၆၀၁ ခု။ တန်ထူလပ္လည် စနိယ်နိယ်... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၉။  " 
	 }, 	
	{ 
	  "Julian Day Number":2173699, 
	  "Myanmar Year":601, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Thursday", 
	  "Description":"ငကောင်ရင်သင်ဂူကျောင်းကျောက်စာ။ သက္ကရစ် ၆၀၁ ခု၊ မာခနှစ် ကဆုန်လဆန် ၅ ရျက် ကြာသပတေနိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁၄။  " 
	 },
	{
	  "Julian Day Number":2173825,
	  "Myanmar Year":601,
	  "Myanmar Month":"Tawthalin",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":13,
	  "Day of the Week":"Thursday",
	  "Description":"လေးမျက်နှာဘုရား ကျောက်စာ။ သကရစ် ၆၀၁ မာခနှစ် တ်သလင်လဆန် ၁၃ ရျက် ကြသပတေ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၀၂။"
	 }, 	  	
	{ 
	  "Julian Day Number":2173827, 
	  "Myanmar Year":601, 
	  "Myanmar Month":"Tawthalin", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Saturday", 
	  "Description":"သင်လျင်သိရတ်မောင်နှံကျောက်စာ။ သကရစ် ၆၀၁ ။ မာခနှစ် တဝ်သလင်လဆန် ၁၅ ရျက် စနိယ်နိယ္အ်လျှင် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁၀။  " 
	 },	
	{ 
	  "Julian Day Number":2173980, 
	  "Myanmar Year":601, 
	  "Myanmar Month":"Tabodwe", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Friday", 
	  "Description":"ရတနာသုံးပါးအားကျွန်လယ်လှူသောကျောက်စာ။ သကရစ် ၆၀၁ ခု မာခါနှစ် တပိုဝ်ထွယ် လဆုတ် ၅ ရျက် သုကြာနိယ်... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၆။  " 
	 },
	{ 
	  "Julian Day Number":2173991, 
	  "Myanmar Year":601, 
	  "Myanmar Month":"Tabaung", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":1, 
	  "Day of the Week":"Monday", 
	  "Description":"မင်းမတ်နဂါပိုရ်မိဖွါးကျောက်စာ။ သကရစ် ၆၀၁ ခု မာဃနှစ်၊ တပေါင်လ္ဆန် ၁ ရျက် ၂ နိယ်အာ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၃။  " 
	 }, 	
	{ 
	  "Julian Day Number":2174151, 
	  "Myanmar Year":602, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":12, 
	  "Day of the Week":"Monday", 
	  "Description":"ဖုန်းသည် သင်ကြီး ငါပံသင် ကျောက်စာ။ သကရစ် ၆၀၂ ခု ကုဆုန်လဆန် ၁၂ ရျက် တနှင်္လာနိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁၅။" 
	 }, 	
	{ 
	  "Julian Day Number":2174152, 
	  "Myanmar Year":602, 
	  "Myanmar Month":"Waso", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":13, 
	  "Day of the Week":"Wednesday", 
	  "Description":"သူကြွယ် ငစုယ်သင် ဘုရားကြီး ကျောက်စာ။ သကရစ် ၆၀၂ ခု ဖုတ်သနှစ် မ္လွယ်တာလ္ဆန် ၁၃ ရျက် ၄ နိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၂၁။" 
	 },
	{
		"Julian Day Number":2174154,
		"Myanmar Year":602,
		"Myanmar Month":"Waso",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Monday",
		"Description":"ဖုန်မ္လတ်ပုရှာ မယ်တော် ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၀၂ ခု ဖ္လကိုန် သံဝစ္ဆိုဝ်ရနှစ် မ္လယ်တာလပ္လည် တန်နှင်လာနိယ် ဖုန်မ္လတ်ပုရှာ မယ်တော်ကာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၂၈။"
	}, 	 	
	{ 
	  "Julian Day Number":2174163, 
	  "Myanmar Year":602, 
	  "Myanmar Month":"Waso", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":9, 
	  "Day of the Week":"Thursday", 
	  "Description":"မကွေးသူ မုဆိုးမ ကျောက်စာ။ သကရစ် ၆၀၂ ခု  မ္လွယ်တာလဆုတ် ၉ ရျက်ကြသပတိယ်နိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၁၉။" 
	 }, 	
	{ 
	  "Julian Day Number":2174272, 
	  "Myanmar Year":602, 
	  "Myanmar Month":"Tazaungmon", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Monday", 
	  "Description":"ငဇဝ်သင် ကျောက်စာ။ သကရစ် ၆၀၂ ခု  ဖလကိုန်နှစ် တန်ဆောင်မှုန် လပ္လည် သတင် တနှင်လာနိယ္အ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၂၀။" 
	 }, 	
	{ 
	  "Julian Day Number":2174410, 
	  "Myanmar Year":603, 
	  "Myanmar Month":"Tagu", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":7, 
	  "Day of the Week":"Monday", 
	  "Description":"ဖွားစောခေါ် အမိပုရှာစော ကျောက်စာ။ သကရစ် ၆၀၃ ခု။ တန်ခူလဆန် ၇ ရျက်။ တနှင်လာနိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၂၉။" 
	 },
	 { 
	  "Julian Day Number":2174447, 
	  "Myanmar Year":603, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Wednesday", 
	  "Description":"ဖွားစောခေါ် အမိပုရဟားစော ကျောက်စာ။ သကရစ် ၆၀၃ ခု။ စယ်နှစ်။ ကုဆုန်လပ္လည် ဗုဒ္ဓဟူနိယ္အ်နှိုက် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၂၄။" 
	 },
	 { 
	  "Julian Day Number":2174617, 
	  "Myanmar Year":603, 
	  "Myanmar Month":"Tazaungmon", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":8, 
	  "Day of the Week":"Friday", 
	  "Description":"သ္ခိင်ဖွားကြီးမြေး စိုးမင်း ကျောက်စာ။ သကရစ် ၆၀၃ ခု စယ်နှစ် တန်ဆောင်မှုန်လ္ဆန် ၈ ရ္ယာက် သုကြာနိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၂၇။" 
	 }, 	 	
	{ 
	  "Julian Day Number":2174772, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Tagu", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":13, 
	  "Day of the Week":"Thursday", 
	  "Description":"ရွှေဂူဘုရား ကျောက်စာ။ သကရစ် ၆၀၄ ခု ဗိသျက် သံဝစ္ဆိုဝ်နှစ် တန်ခူလဆန် ၁၃ ရျက် ကြဿပတိယ်နိယ္အ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၆။" 
	 }, 	
	{ 
	  "Julian Day Number":2174798, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":10, 
	  "Day of the Week":"Friday", 
	  "Description":"ကျစွာမင် မိထွေးတော်ကျောင်း ကျောက်စာ။ သကရစ် ၆၀၄ ခု။ ကဆုန်လ္ဆန် ၁၀ ရျက် သုကြာနိယ်... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၉။" 
	 },
	{ 
	  "Julian Day Number":2174804, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Kason", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Wednesday", 
	  "Description":"သံဗျင် အစလဘိရစ် ဒါနပတိ မောင်နှံ ကျောက်စာ။ သကရစ် ၆၀၄ ခု ဖ္လကုန်နှစ် ကုဆုန်လ ပ္လည် ပုတ္တ ဟူနိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၃၀။" 
	 }, 	 	
	{ 
	  "Julian Day Number":2174913, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Wagung", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":6, 
	  "Day of the Week":"Wednesday", 
	  "Description":"မြေအတွက် အချင်းများသော ကျောက်စာ။ သကရစ် ၆၀၄ ခု ဗိသျက်နှစ် နံကာလဆန် ၆ ရျက် ပုတ္တဟူနိယ် ... ။ ကျစွာမင် မိထွေးတော်ကျောင်း ကျောက်စာ။ သကရစ် ၆၀၄ ခု နံကာလ္ဆန် ၆ ရျက် ပုတ္တဟူနိယ်အာ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၂၊ ၅၉။" 
	 }, 	
	{ 
	  "Julian Day Number":2174951, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Tawthalin", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Thursday", 
	  "Description":"သူကြွယ် ငါမြှောက်သင် ကျောက်စာ။ သကရစ် ၆၀၄ ခု ပိသျက် သံမဆ္စိုရာနှာစ် တဝ်သ္လင်လပ္လည် ကြတ္သပတိယ်နိယ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၃။" 
	 }, 	
	{ 
	  "Julian Day Number":2175005, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Tazaungmon", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":10, 
	  "Day of the Week":"Thursday", 
	  "Description":"သ္ခိင် ငမည်သင် ဂုဏာတိရိတ် ကျောက်စာ။ သကရစ် ၆၀၄ ခု ဗိသျက်နှစ် တန်ဆောင်မှုန်လဆန် ၁(၀) ရျက် ကြသပတိယ်နိယ္အ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၅၄။" 
	 },
	{ 
	  "Julian Day Number":2175054, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Nadaw", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":14, 
	  "Day of the Week":"Thursday", 
	  "Description":"ညောင်ရံကြီး သမီး ကျောက်စာ။ သကရစ် ၆၀၄ ခု။ ပိသျက်နှစ်။ နတ်တော် လဆုတ် ၁၄ ရျက် သတင် ကြဿတိယ်နိယ္အ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၃၃။" 
	 }, 	 	
	{ 
	  "Julian Day Number":2175057, 
	  "Myanmar Year":604, 
	  "Myanmar Month":"Pyatho", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":3, 
	  "Day of the Week":"Sunday", 
	  "Description":"ညောင်ရံကြီး သမီး ကျောက်စာ။ သကရစ် ၆၀၄ ခု။ ပိသျက်နှစ်။ ပ္လသိုဝ်လဆန် ၃ ရျက် တန်နှင်ကုနုယ်နိယ္အ် ... ။ ရှေးဟောင်းမြန်မာကျောက်စာများ-ဒုတိယတွဲ။ စာမျက်နှာ ၃၃။" 
	 },
	{ 
	  "Julian Day Number":2175600, 
	  "Myanmar Year":606, 
	  "Myanmar Month":"Waso", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Monday", 
	  "Description":"ဖုမ်မသင်ကြံကျောင်းကျောက်စာ။ သကရာဇ် ၆၀၅ ခု အာသိတ်နှစ် (နှစ်အမည်အရ ၆၀၆ ဖြစ်မှ ကိုက်ညီမည်) မ္လယ်တာလ္ဆန် ၁၅ ရျက် ဝါဆိုသတ .... င် တနှင်လာနိယ်လျှင်။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၅၇။" 
	 },
	 {
		 "Julian Day Number":2181040,
		 "Myanmar Year":621,
		 "Myanmar Month":"Nayon",
		 "Moon Phase":"Waning",
		 "Fortnight Day":5,
		 "Day of the Week":"Tuesday",
		 "Description":"ငါလပ်သင် ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၂၁ ခု အာသတ်နှစ် နံယုန်လဆုတ် ၅ ရျက် ၃ နိယ္အ် ငါလပ်သင် က္လောင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၂ (က)။"
	 },
	{
		"Julian Day Number":2181652,
		"Myanmar Year":622,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Friday",
		"Description":"မဟာရစ်စေတီ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၂၂ ခု ကြတိုက်နှစ် တပိုဝ္အ်ထွယ်လ္ဆန် ၁၂ ရျက် သုကြာနိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၇ (က)။"
	},
	{
		"Julian Day Number":2182117,
		"Myanmar Year":624,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Monday",
		"Description":"အိုန်ရောက်သင် ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၂၄ ခု ပုတ် သနှစ် ကဆုန်လဆန် ၈ ရျက် တနင်ကနုယ်နိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၁။"
	},
	{
	  "Julian Day Number":2182408,
	  "Myanmar Year":624,
	  "Myanmar Month":"Tabaung",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":3,
	  "Day of the Week":"Friday",
	  "Description":"စိုးမင်းကြာသဝတ် လင်မယား ကျောက်စာ။  သကရစ် ၆၂၄ ခု ပုဿနှစ် တပေါင်လ္ဆန် ၃ ရျက် သောက်ြာနိယ်အာ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၁၀၀ (က)။"
	 },
	{
		"Julian Day Number":2185816,
		"Myanmar Year":634,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waxing",
		"Fortnight Day":13,
		"Day of the Week":"Thursday",
		"Description":"မင်းဖကြီး ကျောက်စာ။ လှူဒါန်း။ .ကရစ် ၆၃၄ ခု ကြတိုက်နှစ်တေ မ္လွယ်တာလဆ. ၁၃ ရျက် ကြာသပတိယ်နိယ်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၆၀။"
	},
	{
		"Julian Day Number":2186041,
		"Myanmar Year":634,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":3,
		"Day of the Week":"Friday",
		"Description":"ရမ္မနာသင် ကျောက်စာ။ လှူဒါန်း။ သဂ္ဂရစ် ၆၃၄ ခု ကြတိုက်နှစ် (တပို)ဝ်ထွယ်လဆန် ၃ ရျက် ၆ နိယ်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၆၃။"
	},
	{
		"Julian Day Number":2186172,
		"Myanmar Year":635,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":13,
		"Day of the Week":"Wednesday",
		"Description":"မြင်းခုန်တိုင် သ္ခိင်မဟာထီ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၃၅ ခု မြိက္ကသိရ်နှစ် နံယုန်လဆန် ၁၃ ရျာက် ဗုဒ္ဓဟော နံနက် နိယ်တက် ၄၅ ဖ္လွါလျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၆၄။"
	},
	{
		"Julian Day Number":2188270,
		"Myanmar Year":640,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Monday",
		"Description":"ငါကြည်စုသင် လင်မယား ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၄၀ ခု ။ တပေါင်လပ္လည် တန်နှင်လာနိယ် ။  ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၈ (ခ)။"
	},
	{
		"Julian Day Number":2188587,
		"Myanmar Year":641,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Wednesday",
		"Description":"မဟာရစ်စေတီ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၄၁ ခု စိဿ်နှစ် တပိုဝ်ဓွယ်လ္ဆန် ၁၀ ရျက် ၄ နိယ် တက်နိယ် ၃၆ ဖ္လွါလျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၇ (ခ)။"
	},
	{
		"Julian Day Number":2189058,
		"Myanmar Year":643,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Friday",
		"Description":"သူကြွယ် အစလပို့ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၄၃ ခု ဖတ္တ်နှစ် ခူဆုန်လဆန် ၆ ရျက် သုကြာနိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၅။"
	},
	{
	  "Julian Day Number":2189802,
	  "Myanmar Year":645,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":12,
	  "Day of the Week":"Sunday",
	  "Description":"သတင်းသည် အပယ်ငယ် ကျောက်စာ။  သကရစ် ၆၄၅ ခု အာသိန်နှစ် အဓိမတ် နံယုန်လဆန် ၁၂ ရျက် တနှင်ဂုနိုယ်နိယ်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၄ (က)။"
	 },
	{
	  "Julian Day Number":2191567,
	  "Myanmar Year":650,
	  "Myanmar Month":"Tagu",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":5,
	  "Day of the Week":"Monday",
	  "Description":"ငါဖွယ်သင်လင်မယား ကျောက်စာ။ သကရစ် ၆၅၀ ခု တန်ခူလဆန် ၅ ရျက် တနှင်လာနိယ် ... ။  မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၆၈ (က)။"
	 },
	{
		"Julian Day Number":2192147,
		"Myanmar Year":651,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":8,
		"Day of the Week":"Sunday",
		"Description":"မဟာရစ်စေတီ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၅၁ ခု စယ်နှစ် သန္တူလ္ဆုတ် ၈ ရျက် ၁ နိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၇ (ခ)။"
	},
	{
		"Julian Day Number":2193376,
		"Myanmar Year":654,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Thursday",
		"Description":"Athinkhaya, Yazathingyan, Thihathu appointed viceroys."
	},
	{
	  "Julian Day Number":2193607,
	  "Myanmar Year":655,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":7,
	  "Day of the Week":"Thursday",
	  "Description":"ပုထိုးနီမင်းနှင့်မင်းကျစွာကျောက်စာ။ သကရစ် ၆၅၅ ခု သရဝန်နှစ် တန်ဆောင်မှုန် (လ္ဆန်။ သာသနာ ၇ ရက်ကြာသပတိ...)၊ နေိယ်လျှင် ပုထိုင်နီမင်နှင်မင်က္လဟွာ မောင်နှံ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၁၀(က)။"
	 },
	{
	  "Julian Day Number":2193915,
	  "Myanmar Year":656,
	  "Myanmar Month":"Wagung",
	  "Moon Phase":"Waning",
	  "Fortnight Day":5,
	  "Day of the Week":"Thursday",
	  "Description":"သ္ခိင်ကုနကမ္ဘီ ကျောက်စာ။ သကရစ် ၆၅၆ ခု ဘတ်နှစ် နံကာလ္ဆုတ် ၅ ရျက် ၅ နိယ်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၂ (ခ)။"
	 },
	{
		"Julian Day Number":2193998,
		"Myanmar Year":656,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Wednesday",
		"Description":"သူကြွယ် ငက္လုံသင် ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၅၆ ခု ။ သရဝန်နှစ် (? possible year error)။ တန်ဆောင်မှုန်လပ္လည် ။ ပုတ္တ (ဟူနိ)ယ် ။ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၆၈။"
	},
	{
		"Julian Day Number":2194673,
		"Myanmar Year":658,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waxing",
		"Fortnight Day":14,
		"Day of the Week":"Sunday",
		"Description":"မ္လတ်ကြီးစွာ သိမ်ကျောင်း ကျောက်စာ။ ရာဇသင်ကြံ၊ သံပျင်သိင်္ကသူ။ လှူဒါန်း။ သကရစ် ၆၅၈ သန္တု လ္ဆန် ၁၄ ရျက် (၁ နိယ်) နှိုက် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၀။"
	},
	{
		"Julian Day Number":2194743,
		"Myanmar Year":658,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Saturday",
		"Description":"သီဟသူရမင်းကြီးကျောက်စာ။ သီဟသူကုလားကျောင်း၊ ကျောင်းဝင်းအတွင်း၊ မြင်စိုင်းမြို့။ လှူဒါန်း။ သကရစ် ၆၅၈ ခု ကြတိုက်နှစ် နတ္တ်လ္ဆုတ် ၇ ရျက် ၀နေ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၄။"
	},
	{
		"Julian Day Number":2195091,
		"Myanmar Year":659,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":15,
		"Day of the Week":"Thursday",
		"Description":"မ္လတ်ကြီးစွာ သိမ်ကျောင်း ကျောက်စာ။ ရာဇသင်ကြံ၊ သံပျင်သိင်္ကသူ။ လှူဒါန်း။ သကရစ် ၆၅၉ ခု တန်ဆောင်မှုန်လ္ဆန် ၁၅ ရျက် ၅ နိယ်နှိုက္က်ာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၀။"
	},
	{
		 "Julian Day Number":2195147,
		 "Myanmar Year":659,
		 "Myanmar Month":"Pyatho",
		 "Moon Phase":"Waxing",
		 "Fortnight Day":13,
		 "Day of the Week":"Thursday",
		 "Description":"မင်းမတ် သတျာပိစည်း ကျောက်စာ။ လှူဒါန်း။ သက်ရစ် ၆၅၉ ခု မြိုက္က်သိုဝ်နှစ် ပ္လသိုဝ်လ္ဆန် ၁၃ ရျက် ၅ နိယ်လျှင် နန်က္လမင် ကွန်ပြောက်ကြီ ထွက်တဝ်မူသော မင်မတ် သတျာပိစည် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၁ (က)။"
	 },
	{
	  "Julian Day Number":2195169,
	  "Myanmar Year":659,
	  "Myanmar Month":"Tabodwe",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":3,
	  "Day of the Week":"Friday",
	  "Description":"သိမ်ကျောင်း စေတီအား မြေလှူသော ကျောက်စာ။ သကရစ် ၆၅၉ ခု မြိုက္ကသိုဝ်နှစ် တပိုဝ်ထွယ်လ္ဆန်း ၃ ရျက် သူကြာနိယ် ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၉၅။"
	 },
	{
		"Julian Day Number":2195183,
		"Myanmar Year":659,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":4,
		"Day of the Week":"Friday",
		"Description":"သံပျင် သတျာပတေ့ကျောင်း ကျောက်စာ။ သံပျင် သတျာပတေ့။ လှူဒါန်း။ သကရစ် ၆၅၉ ခု မြိက်ကသိုလ်နှစ် တပိုဝ်ထွယ်လ္ဆုတ် ၄ ရျက် သုကြာနိယ် ပန်ပွတ်ရပ်စေတီ မ္လစ်နှိုက် သံပျင် သတျာပတိယ် ကုလာက္လောင်ပြသတ် စလစ်ဥိထွက် ပ္လု၏ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၃၆။"
	},
	{
	  "Julian Day Number":2195620,
	  "Myanmar Year":661,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":10,
	  "Day of the Week":"Monday",
	  "Description":"မိသင်၏သား ငါတပါညီ ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၆၆၁ မာခနှစ် ခုဆုန် လဆန် ဆယ်ရျက် တနှင်လာနိယ္အ်၊ မိသင် သာ ငါတပါ ငီ ပေါက်တိုဝ်ရပ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၃။"
	 },
	{
		"Julian Day Number":2195648,
		"Myanmar Year":661,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Monday",
		"Description":"မ္လတ်ကြီးစွာ သိမ်ကျောင်း ကျောက်စာ။ ရာဇသင်ကြံ၊ သံပျင်သိင်္ကသူ။ လှူဒါန်း။ သကရစ် ၆61 ခု နံမျုန်လ္ဆန် ၁၂ ရျက် ၂ နိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၀။"
	},
	{
	  "Julian Day Number":2196712,
	  "Myanmar Year":664,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":13,
	  "Day of the Week":"Monday",
	  "Description":"ရွှေနန်းသျှင်ကျောင်း ကျောက်စာ။  သက္ကရစ် ၆၆၄ ခု ဖုဿနှစ် (should be ပိသျက်?) ကဆုန် လ္ဆန် ၁၃ ရျက် ၂ နိယ် ရှုဲနန်သျင် လှူသော ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၅။"
	 },
	{
	  "Julian Day Number":2197332,
	  "Myanmar Year":665,
	  "Myanmar Month":"Pyatho",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":12,
	  "Day of the Week":"Friday",
	  "Description":"အသင်္ခယာကျောင်း ကျောက်စာ။  သက္ကရစ် ၆၆၅ ခု စိဿနှစ် ပ္လတ်သိုဝ်လ္ဆန် ၁၂ ရျက် သောက်ကြာနေလျှင် သာသနာ ၅၀၀၀ လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၆ (က)။"
	 },
	{
	  "Julian Day Number":2199000,
	  "Myanmar Year":670,
	  "Myanmar Month":"Waso",
	  "Moon Phase":"Waning",
	  "Fortnight Day":10,
	  "Day of the Week":"Sunday",
	  "Description":"မင်းမတ်ကြီး သုံးယောက်နှမ ကျောက်စာ။ သကရစ် ၆၇၀ ကြာတိုက်နှစ် မ္လွယ်တာလ္ဆုတ် ၁၀ ရျက် ၊ တနှင်ကနှုယ်နိယ်အာ ၊ မင်မတ်ကြီ သုံယောက်နှမ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၈၆။"
	 },
	{
	  "Julian Day Number":2198820,
	  "Myanmar Year":669,
	  "Myanmar Month":"Tabodwe",
	  "Moon Phase":"Waning",
	  "Fortnight Day":9,
	  "Day of the Week":"Tuesday",
	  "Description":"လှည်းငှူးနှင့် အမတ်ကြီး ရာဇာသင်ကြံတို့ ကျောက်စာ။ သကရစ် ၆၆၉ ခုအာသိန်နှစ် တပိုဝ်ထွယ် လ္ဆုတ် ၉ ရျက် အင်ကာနိယ် လှည်ငှူသ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၈၇။"
	 },
	{
	  "Julian Day Number":2199305,
	  "Myanmar Year":671,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":5,
	  "Day of the Week":"Thursday",
	  "Description":"ရတနာစေတီ ကျောက်စာ။ သကရစ် ၆၇၁ ခု မြက္ကသိုဝ်နှစ် နံယုန် လ္ဆန် ၅ ရျက် ကြာသပတိယ် ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၈၃ (က)။"
	 },
	{
	  "Julian Day Number":2200631,
	  "Myanmar Year":674,
	  "Myanmar Month":"Tabodwe",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":3,
	  "Day of the Week":"Sunday",
	  "Description":"အဘယတေ တောကျောင်း မြတ်ကြီးစေတီ ကျောက်စာ။ သကရစ် ၆၇၄ ခု ဖ္လကိုန်နှစ် တပိုဝ်ထွယ် လ္ဆန် ၃ ရက် ၁ နိယ်လျှင် သ္ခိင် အဘယထေ တဝ်က္လောင် ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၈၁။"
	 },
	{
		"Julian Day Number":2200669,
		"Myanmar Year":674,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Wednesday",
		"Description":"Foundation of Pinya."
	},
	{
	  "Julian Day Number":2200986,
	  "Myanmar Year":675,
	  "Myanmar Month":"Pyatho",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":4,
	  "Day of the Week":"Friday",
	  "Description":"ကိုရံသူကြီးကျောင်း ကျောက်စာ။ သကရစ်ကာ ၆၇၅ ခု စိဿနှစ် (*မှတ်ချက် - ၆၇၅ ဆိုပါက စယ်နှစ်ဖြစ်သင့်သည်) ပ္လသိုဝ်လဆန် ၄ ရျက် သုက်ကြာနိယ်ေတ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၈၀။"
	 },
	{
		"Julian Day Number":2201496,
		"Myanmar Year":677,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Thursday",
		"Description":"Sagaing Kingdom founded."
	},
	{
	  "Julian Day Number":2203117,
	  "Myanmar Year":681,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":9,
	  "Day of the Week":"Monday",
	  "Description":"မြင်စိုင်းကျောင်း ကျောက်စာ။  သက္ကရစ် ၆၈၁ ခု အာသိန်နှစ် တန်ဆောင်မုန်လ္ဆန် ၉ ရျက် ၂ နိယ်  သာသနာ ၅၀၀၀ တည်စိမ်သောငှာ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၆ (ခ)။"
	 },
	{
	  "Julian Day Number":2204941,
	  "Myanmar Year":686,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":2,
	  "Day of the Week":"Friday",
	  "Description":"ကန်စွက်ကျောင်း ကျောက်စာ။ သကရစ် ၆၈၆ ခု ဓိမှတိနှစ် တန်ဆောင်မှုန်။ လ္ဆန် သာသနာ ၂ ရျက် ၆ နိယ် တောင်ပနှိုက်။ တောင်ပမင် စေတီ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၉၄။"
	 },
	{
	  "Julian Day Number":2205535,
	  "Myanmar Year":688,
	  "Myanmar Month":"Waso",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":6,
	  "Day of the Week":"Thursday",
	  "Description":"ရာဇသင်ကြံ မျောက်သား ကျောက်စာ။ သက္စြ် ၆၈၈ ၊ နွယ်တာလ္ဆန် ၆ ၊ ၅ ၊ စစ်သူကြီ ရယ်စစင်ကြံ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၉၆။"
	 },
	{
	  "Julian Day Number":2206515,
	  "Myanmar Year":690,
	  "Myanmar Month":"Tabaung",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":10,
	  "Day of the Week":"Thursday",
	  "Description":"သရအိုင် သာရီရိက စေတီတော် ကျောက်စာ။ ကရစ် ၆၉၀ အာသတ်(နှစ်) တပေါင် .န် ၁၀ ရျက် ၅ နိယ်လျှင် ဖုန်မ္တတ်ကြိစွာ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၉၇။"
	 },
	{
	  "Julian Day Number":2207887,
	  "Myanmar Year":694,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waning",
	  "Fortnight Day":9,
	  "Day of the Week":"Thursday",
	  "Description":"မင်းမတ် အထင်္ကပိစည်းကျောင်း ကျောက်စာ။ သက္ကရစ် ၆၉၄ ခု ကြတိုက်နှစ် တန်ဆောင်မှုန်လ္ဆုတ် ၉ ရျက် ၅ နေအာ မင်မတ်ထင်္ကပိစည်ကာ  ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၉၈ (က)။"
	 },
	{
	  "Julian Day Number":2209053,
	  "Myanmar Year":697,
	  "Myanmar Month":"Tabodwe",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":7,
	  "Day of the Week":"Monday",
	  "Description":"မထောစေတီ ကျောက်စာ။  သကရစ် ၆၉၇ ခု မာခနှစ် တပိုဝ်ထလ္ဆန် ၇ ရျက် ၂ နိယ်အာ ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၁၀၁။"
	 },
	{
	  "Julian Day Number":2209175,
	  "Myanmar Year":698,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":11,
	  "Day of the Week":"Thursday",
	  "Description":"တန်လိုင်သူကြီးဖုံမသင်ကြံကျောက်စာ။ သကရစ် ၆၉၈ စဲနှစ် နမျုန်လ္ဆန်၁၁ ၅နိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၀၈။"
	 },
	{
	  "Julian Day Number":2209585,
	  "Myanmar Year":699,
	  "Myanmar Month":"Waso",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":10,
	  "Day of the Week":"Monday",
	  "Description":"သုံးပန်လှဘုရား ကျောက်စာ။  သကရစ် ၆၉၉ ခု စယ်နှစ် မ္လွယ်တာလ္ဆန် ဆဲရျက် တနှင်လာနေ ဖုံမ္မကြံ မောင်နှံ ကောင်မှုပ္လုရုယ် ...  ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် ၁၁၃။"
	 },
	{
	  "Julian Day Number":2214285,
	  "Myanmar Year":712,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waning",
	  "Fortnight Day":1,
	  "Day of the Week":"Thursday",
	  "Description":"သကရာဇ် ၇၁(၂) ပိဿျက်နှစ် နံယုန် လ လ္ဆုတ် တရျက် ကြသပတေနေ နေတက် ၇ ဖ္လွါလျှင် တေည်သတေ ... ။ အလှူရှင် -ငကြိသင်။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် (၇၈-ခ)။"
	 },
	 {
	   "Julian Day Number":2215073,
	   "Myanmar Year":714,
	   "Myanmar Month":"Wagung",
	   "Moon Phase":"Waxing",
	   "Fortnight Day":4,
	   "Day of the Week":"Monday",
	   "Description":"သကရစ် ၇၁၄ ခု၊ အသတ်နှစ် နံကာလဆန် ၄ ရျက် တန်နှင်လာနိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၇၉။"
	  },
	 {
	   "Julian Day Number":2215292,
	   "Myanmar Year":714,
	   "Myanmar Month":"Tabaung",
	   "Moon Phase":"Waning",
	   "Fortnight Day":3,
	   "Day of the Week":"Wednesday",
	   "Description":"မိတ္ထိလာလင်စင်းကန်ရိုးယှိ ကျောက်စာ။ သကရစ် ၇၁၄ ခု အာသတ်နှစ် တပေါင်လ္ဆုတ် ၃ ရျက် ပုတ္တဟူနိယ်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၆၉။"
	  },
	{
	  "Julian Day Number":2216434,
	  "Myanmar Year":718,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":8,
	  "Day of the Week":"Thursday",
	  "Description":"မင်းနန်သူကျောင်းကျောက်စာ။ ...ရစ် ၇၁၈ ခု ကြတိုက်နှစ် ကဆုန်လ္ဆန် ၈ ရျက် (၅နေအား) ရတနာသုံမ်ပါ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၂၆ (က)။"
	 }, 	
	{ 
	  "Julian Day Number":2216756, 
	  "Myanmar Year":718, 
	  "Myanmar Month":"Tabaung", 
	  "Moon Phase":"Waxing", 
	  "Fortnight Day":5, 
	  "Day of the Week":"Monday", 
	  "Description":"မာရဖင်ရတနာ စည်းခုံဘုရားကျောံစာ။ သကရစ် ၇၁၈ ခု တပေါင်လ္ဆန် ၅ ရျက် ၂လာနေလျှင် ...။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၉၃။" 
	 },
	{
	  "Julian Day Number":2216924,
	  "Myanmar Year":719,
	  "Myanmar Month":"Wagung",
	  "Moon Phase":"Waning",
	  "Fortnight Day":8,
	  "Day of the Week":"Thursday",
	  "Description":"တလုပ်မြို့သက်တော်ရဘုရားကျောက်စာ။သကြစ် ၇၁၉ ခုမြိုင်က္ကသိုဝ်နှစ်ဝါခေါင်လဆုတ်၈ရက် ၅ နေိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၃၀။"
	 },
	{
	  "Julian Day Number":2218441,
	  "Myanmar Year":723,
	  "Myanmar Month":"Tazaungmon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":7,
	  "Day of the Week":"Tuesday",
	  "Description":"ရွှေစည်းခုံဘုရားကျောက်စာ။ သကရစ် ၇၂၃ ခု စယ်နှစ် တံဆောင်မုန်လ္ဆန် ၇ ရျက် ၃ နိယ် နက္ခ်တ် ၂၆ ခုပြိစ္ဆာလက်လျှင် ရွာ . တည်၏ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၁၈။"
	 },
	{
	  "Julian Day Number":2218961,
	  "Myanmar Year":724,
	  "Myanmar Month":"Tabaung",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":10,
	  "Day of the Week":"Sunday",
	  "Description":"အမတ်ကြီးသရေအသင်္ခယာ ကျောက်စာ။ သကရစ် ၇၂၄ ခု ပိဿျက်နှစ်တပေါင်းလ္ဆန် ၁၀ရျက်၁နွေနိယ် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၃၈(က)။"
	 },
	{
		"Julian Day Number":2219652,
		"Myanmar Year":726,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Tuesday",
		"Description":"Foundation of Inwa."
	},
	{
		"Julian Day Number":2220369,
		"Myanmar Year":727,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Friday",
		"Description":"မိတ္တရ သိန်းစည်း အမတ်ကြီး ကျောက်စာ၊ မိတ္တရ သိန်းစည်း အမတ်ကြီး၊ မိဖုရားစောဥမ္မဒန္တီ စန္တသူအမတ်ကြီး။ ကျောင်း၊ မြေ၊ လယ် လှူဒါန်း။ ... သကရစ် ၇၂၇ ခု တပိုဝ်ထွယ်လပ္လည် သောက်ကြာနေ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၁။ ကျောက်တိုင်အမှတ် နံပါတ် ၁၈။ (Year should be 728 if it is friday. 7 and 8 error is common.)"
	},
	{
		"Julian Day Number":2220747,
		"Myanmar Year":729,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"Razadarit’s DOB."
	},
	{
	  "Julian Day Number":2222556,
	  "Myanmar Year":734,
	  "Myanmar Month":"Tabodwe",
	  "Moon Phase":"Full moon",
	  "Fortnight Day":15,
	  "Day of the Week":"Monday",
	  "Description":"သကရာဇ် ၇၃၄ ခု ဖ္လကိုန်နှစ် တပိုဝ်ထွယ် လပ္လည် တနှင်လာ နံနက်စေတီသည်သတေ ... ။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် (၇၈-က)။"
	 },
	{
	  "Julian Day Number":2223369,
	  "Myanmar Year":737,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":6,
	  "Day of the Week":"Tuesday",
	  "Description":"သက္ကရာဇ် ၇၃၇ ခု ကဆုန်လဆန် ၆ ရျက် အင်္ကာနေလျင် ... ။ အလှူရှင် -ငကြိသင်။ မန္တလေးနန်းတွင်းကျောက်စာများ အတွဲ ၂။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံ (၁) အတွင်း။ ကျောက်တိုင်အမှတ် နံပါတ် (၇၈-ခ)။"
	 },
	{
		"Julian Day Number":2226567,
		"Myanmar Year":745,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Monday",
		"Description":"Razadarit comes to power."
	},
	{
	  "Julian Day Number":2228075,
	  "Myanmar Year":749,
	  "Myanmar Month":"Tabaung",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":14,
	  "Day of the Week":"Thursday",
	  "Description":"သူကြီး ကျောက်စာ။ နမောတဿတိ၊ သက္ကရာဇ် ၇၄၉ ခု၊ ပြိဿနှစ် တပေါင် လ္ဆန် တဆယ် ၄ ရျက်၊ ကြာသပတေနိယ်အာ၊ မြမ္မာပြည် အကြေအညာ  ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၇၄၉။"
	 },
	{
	  "Julian Day Number":2230727,
	  "Myanmar Year":757,
	  "Myanmar Month":"Nayon",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":8,
	  "Day of the Week":"Wednesday",
	  "Description":"ပုခြည်သူကြီး ကျောက်စာ။ ... ရစ် ၇၅၇၊ နယုန်လ္ဆန် ၈ ရျက် ၄ နေ ပုခြည်သူကြီ... ။  မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့၊ နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၇၀။"
	 }, 	 	
	{ 
	  "Julian Day Number":2231097, 
	  "Myanmar Year":758, 
	  "Myanmar Month":"Nayon", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":9, 
	  "Day of the Week":"Wednesday", 
	  "Description":"မာရဖင်ရတနာ စည်းခုံဘုရားကျောံစာ။ သက္ကရစ် ၇၅၈ ခု နံမျုန် လ္ဆုတ် ၉ ရျက် ပုတ်တဟူနေလျှင် ...။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၉၃။" 
	 },
	{ 
	  "Julian Day Number":2233185, 
	  "Myanmar Year":763, 
	  "Myanmar Month":"Tabaung", 
	  "Moon Phase":"Full moon", 
	  "Fortnight Day":15, 
	  "Day of the Week":"Thursday", 
	  "Description":"ပျူကန်မင်းမတ်သရေလင်မယားကျောင်းကျောံစာ။ ... ၇၆၃ ခု၊ အာသိုတ်နှစ် (နှစ်အမည်သရဝန်နှစ်ဖြစ်မှကိုက်ညီမည်) တပေါင်လပ္လည် ကြာ ...။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၇၈။" 
	 },
	{
		"Julian Day Number":2234932,
		"Myanmar Year":768,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Monday",
		"Description":"Minye Kyawswa takes Launggyet."
	},
	{
		"Julian Day Number":2237958,
		"Myanmar Year":776,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Wednesday",
		"Description":"Minye Kyawswa dies."
	},
	{
	  "Julian Day Number":2239232,
	  "Myanmar Year":780,
	  "Myanmar Month":"Thadingyut",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":10,
	  "Day of the Week":"Wednesday",
	  "Description":"တန်ဆောင်းကျောင်း ကျောက်စာ။ သက္ကရစ် ၇၈၀ ဝါကျွတ်လဆန် ၁၀ ရက် ပိတဟူနေနှိုက် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၀၅(မျက်နှာ)။"
	 },
	{
	  "Julian Day Number":2239373,
	  "Myanmar Year":780,
	  "Myanmar Month":"Tabaung",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":1,
	  "Day of the Week":"Thursday",
	  "Description":"ယောက်ခမတော်ကျောင်းကျောက်စာ။ သက္ကရဇ် ၇၈၀ မာခနှစ် တပေါင်လဆန်တရက် ကြာသပဒေနေနှိုက်၊ မ္လိယ်သျှင်နှစ်ပါ စကာမျာကြသည် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၀၅(ကျော)။"
	 },
	{
		"Julian Day Number":2243108,
		"Myanmar Year":791,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Thursday",
		"Description":"Min Saw Mon becomes king."
	},
	{
	  "Julian Day Number":2243847,
	  "Myanmar Year":793,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Full moon",
	  "Fortnight Day":15,
	  "Day of the Week":"Friday",
	  "Description":"စည်းခုံဘုရား ကျောက်စာ။ သက္ကရာဇ် ၇၉၃ ကဆုန်လပ္လည်သတင်သောက်ကြာနေိ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၃၅(က)။"
	 },
	{
		"Julian Day Number":2244590,
		"Myanmar Year":795,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Saturday",
		"Description":"Min Saw Mon dies."
	},
	{
	  "Julian Day Number":2245253,
	  "Myanmar Year":797,
	  "Myanmar Month":"Tagu",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":7,
	  "Day of the Week":"Thursday",
	  "Description":"ဘုရားထုရွာသူကြီး ကျောက်စာ။ လှူဒါန်း။ သကရစ် ၇၉၇ ခု ၊ တန်ခုလဆန် ခုနှစ်ရက် ကြာသပတေနေ၊ ဖုရာထုရွာသူကြိ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၃၄(က)။"
	 },
	{
	  "Julian Day Number":2253758,
	  "Myanmar Year":820,
	  "Myanmar Month":"Waso",
	  "Moon Phase":"Waxing",
	  "Fortnight Day":5,
	  "Day of the Week":"Thursday",
	  "Description":"နရပတိမင်းကျောင်းကျောက်စာ။ သက္ကြစ် ၈၂၀။ ဝါဆိုလ္ဆန် ငါရက် ကြာသပတေနေညနေလွဲခုနစ်ခါနှိုက်လျှင် ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၅၈(က)။"
	 },
	{
	  "Julian Day Number":2254065,
	  "Myanmar Year":821,
	  "Myanmar Month":"Kason",
	  "Moon Phase":"Waning",
	  "Fortnight Day":2,
	  "Day of the Week":"Wednesday",
	  "Description":"နရပတိမင်းကျောင်းကျောက်စာ။ သက္ကြစ် ၈၂၁။ ကဆုန် လ္ဆုတ် ၂ ရျက် ပုတ္တဟူနေ (နေတက်တပဟိုဝ်တွင်လျှင်) ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၅၈(က)။"
	 },
	{
	  "Julian Day Number":2257784,
	  "Myanmar Year":831,
	  "Myanmar Month":"Waso",
	  "Moon Phase":"Full moon",
	  "Fortnight Day":15,
	  "Day of the Week":"Monday",
	  "Description":"စူဠာမုဏိဘုရား ကျောက်စာ။ ၈၃၁ ။ နွဲတာလပြည်၊ တနှင်လာ ရက်နှိုက်၊ နှစ်သိန်လေသောင်၊ အထုဟိသ ... ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ (၂) ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၄၅၇။"
	 },
	{
		"Julian Day Number":2265960,
		"Myanmar Year":853,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Friday",
		"Description":"Foundation of Dwarawaddy (Toungoo)."
	},
	{
		"Julian Day Number":2269428,
		"Myanmar Year":863,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":9,
		"Day of the Week":"Thursday",
		"Description":"Coronation of Narapati II of Ava."
	}, 	
	{ 
	  "Julian Day Number":2270840, 
	  "Myanmar Year":867, 
	  "Myanmar Month":"Tagu", 
	  "Moon Phase":"Waning", 
	  "Fortnight Day":3, 
	  "Day of the Week":"Tuesday", 
	  "Description":"သက္ကရာဇ် ၈၆၇ တန်ခုလဆုတ် သုံရက် အင်ကာနေ၊ နက်သတ်သုံလုံ။ မန္တလေးနန်းတွင်းကျောက်စာရုံ(၂)ရှိကျောက်စာများ။ မန္တလေးမြို့နန်းတွင်းကျောက်စာရုံငယ်။ ကျောက်တိုင်အမှတ် နံပါတ် ၅၇၃။" 
	 },
	{
		"Julian Day Number":2272876,
		"Myanmar Year":872,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Friday",
		"Description":"Mingyi Nyo declares independence from Ava."
	},
	{
		"Julian Day Number":2273003,
		"Myanmar Year":872,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":9,
		"Day of the Week":"Saturday",
		"Description":"Narapati II founds a new palace."
	},
	{
		"Julian Day Number":2278115,
		"Myanmar Year":886,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"New moon",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"Ava falls to the Confederation (1st time)."
	},
	{
		"Julian Day Number":2278866,
		"Myanmar Year":888,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Wednesday",
		"Description":"Ava falls to the Confederation (2nd and final time)."
	},
	{
		"Julian Day Number":2280218,
		"Myanmar Year":892,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"Tabinshwehti becomes king."
	},
	{
		"Julian Day Number":2280402,
		"Myanmar Year":893,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Saturday",
		"Description":"Min Bin becomes king of Mrauk-U."
	},
	{
		"Julian Day Number":2280965,
		"Myanmar Year":894,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":15,
		"Day of the Week":"Tuesday",
		"Description":"Min Bin takes Dhaka."
	},
	{
		"Julian Day Number":2281024,
		"Myanmar Year":894,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"Min Bin celebrates victory over Bengal."
	},
	{
		"Julian Day Number":2284411,
		"Myanmar Year":904,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"Prome surrenders to Toungoo forces."
	},
	{
		"Julian Day Number":2284949,
		"Myanmar Year":905,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Wednesday",
		"Description":"Confederation begins campaign to retake Prome."
	},
	{
		"Julian Day Number":2286039,
		"Myanmar Year":908,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Monday",
		"Description":"Toungoo begins Arakan campaign."
	},
	{
		"Julian Day Number":2286121,
		"Myanmar Year":908,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":2,
		"Day of the Week":"Saturday",
		"Description":"Toungoo forces capture Launggyet."
	},
	{
		"Julian Day Number":2286128,
		"Myanmar Year":908,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Saturday",
		"Description":"Treaty of Mrauk-U signed."
	},
	{
		"Julian Day Number":2286781,
		"Myanmar Year":910,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":13,
		"Day of the Week":"Monday",
		"Description":"Siam campaign begins."
	},
	{
		"Julian Day Number":2286783,
		"Myanmar Year":910,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Wednesday",
		"Description":"Burmese armies leave Kanchanaburi for Ayutthaya."
	},
	{
		"Julian Day Number":2286889,
		"Myanmar Year":910,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waxing",
		"Fortnight Day":3,
		"Day of the Week":"Thursday",
		"Description":"Tabinshwehti gets back to Pegu."
	},
	{
		"Julian Day Number":2287316,
		"Myanmar Year":912,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Thursday",
		"Description":"Tabinshwehti assassinated."
	},
	{
		"Julian Day Number":2287524,
		"Myanmar Year":912,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Thursday",
		"Description":"Bayinnaung marches to Toungoo."
	},
	{
		"Julian Day Number":2287571,
		"Myanmar Year":912,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Sunday",
		"Description":"Bayinnaung takes Toungoo."
	},
	{
		"Julian Day Number":2287802,
		"Myanmar Year":913,
		"Myanmar Month":"Tawthalin",
		"Moon Phase":"New moon",
		"Fortnight Day":15,
		"Day of the Week":"Sunday",
		"Description":"Bayinnaung takes Prome."
	},
	{
		"Julian Day Number":2287997,
		"Myanmar Year":913,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":3,
		"Day of the Week":"Saturday",
		"Description":"Bayinnaung takes Pegu."
	},
	{
		"Julian Day Number":2288668,
		"Myanmar Year":915,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Friday",
		"Description":"Coronation of Bayinnaung and Atula Thiri at Pegu."
	},
	{
		"Julian Day Number":2289043,
		"Myanmar Year":916,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":2,
		"Day of the Week":"Tuesday",
		"Description":"Bayinnaung takes Ava."
	},
	{
		"Julian Day Number":2289700,
		"Myanmar Year":918,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Monday",
		"Description":"Bayinnaung prepares to invade cis-Salween Shan states."
	},
	{
		"Julian Day Number":2289760,
		"Myanmar Year":918,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Friday",
		"Description":"Bayinnaung begins campaign to Shan states."
	},
	{
		"Julian Day Number":2289777,
		"Myanmar Year":918,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":11,
		"Day of the Week":"Monday",
		"Description":"Bayinnaung conquers Mong Mit (Momeik) and Hsipaw (Thibaw)."
	},
	{
		"Julian Day Number":2289791,
		"Myanmar Year":918,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Monday",
		"Description":"Bayinnaung dedicates a pagoda each at Mong Mit and at Hsipaw."
	},
	{
		"Julian Day Number":2289831,
		"Myanmar Year":918,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Saturday",
		"Description":"Bayinnaung conquers Mong Yang (Mohnyin)."
	},
	{
		"Julian Day Number":2289837,
		"Myanmar Year":918,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":12,
		"Day of the Week":"Friday",
		"Description":"Bayinnaung conquers Mong Kawng (Mogaung)."
	},
	{
		"Julian Day Number":2289851,
		"Myanmar Year":919,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Friday",
		"Description":"Bayinnaung leaves Mong Kawng (Mogaung)."
	},
	{
		"Julian Day Number":2289895,
		"Myanmar Year":919,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waning",
		"Fortnight Day":11,
		"Day of the Week":"Sunday",
		"Description":"Bayinnaung dedicates a bell at the Shwezigon Pagoda."
	},
	{
		"Julian Day Number":2290052,
		"Myanmar Year":919,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Wednesday",
		"Description":"Bayinnaung begins campaign to Mong Nai (Mone)."
	},
	{
		"Julian Day Number":2290209,
		"Myanmar Year":920,
		"Myanmar Month":"Tagu",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"Bayinnaung takes Chiang Mai."
	},
	{
		"Julian Day Number":2290437,
		"Myanmar Year":920,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"Thado Minsaw’s Army leaves for Chiang Mai."
	},
	{
		"Julian Day Number":2290641,
		"Myanmar Year":921,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"Groundbreaking ceremony for the Mahazedi Pagoda."
	},
	{
		"Julian Day Number":2290798,
		"Myanmar Year":921,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":14,
		"Day of the Week":"Sunday",
		"Description":"Yaza Datu Kalaya born."
	},
	{
		"Julian Day Number":2290801,
		"Myanmar Year":921,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Wednesday",
		"Description":"Dedicates the relic chamber of the Mahazedi."
	},
	{
		"Julian Day Number":2290818,
		"Myanmar Year":921,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Saturday",
		"Description":"Binnya Dala begins Manipur campaign."
	},
	{
		"Julian Day Number":2290995,
		"Myanmar Year":922,
		"Myanmar Month":"First Waso",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Monday",
		"Description":"Binnya Dala arrives back at Pegu (after a successful Manipur campaign)."
	},
	{
		"Julian Day Number":2291215,
		"Myanmar Year":922,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Thursday",
		"Description":"Umbrella (hti) raising ceremony at the Mahazedi."
	},
	{
		"Julian Day Number":2291311,
		"Myanmar Year":923,
		"Myanmar Month":"Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":9,
		"Day of the Week":"Tuesday",
		"Description":"Birth of son Thingadatta."
	},
	{
		"Julian Day Number":2291744,
		"Myanmar Year":924,
		"Myanmar Month":"Waso",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Wednesday",
		"Description":"Fortifies Tavoy (Dawei) – for the upcoming invasion of Siam."
	},
	{
		"Julian Day Number":2291898,
		"Myanmar Year":924,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Monday",
		"Description":"Keng Tung submits."
	},
	{
		"Julian Day Number":2291979,
		"Myanmar Year":924,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Friday",
		"Description":"Campaign to Chinese Shan States begins."
	},
	{
		"Julian Day Number":2291985,
		"Myanmar Year":924,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Wednesday",
		"Description":"Yaza Dewi raised to senior queen."
	},
	{
		"Julian Day Number":2292140,
		"Myanmar Year":925,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":12,
		"Day of the Week":"Friday",
		"Description":"Sends an embassy to Siam, demanding tribute."
	},
	{
		"Julian Day Number":2292248,
		"Myanmar Year":925,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waning",
		"Fortnight Day":12,
		"Day of the Week":"Monday",
		"Description":"Siam Campaign begins."
	},
	{
		"Julian Day Number":2292346,
		"Myanmar Year":925,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":11,
		"Day of the Week":"Monday",
		"Description":"Overruns Portuguese defenses at the Ayutthaya harbor."
	},
	{
		"Julian Day Number":2292357,
		"Myanmar Year":925,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"Siam surrenders."
	},
	{
		"Julian Day Number":2292604,
		"Myanmar Year":926,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waning",
		"Fortnight Day":4,
		"Day of the Week":"Sunday",
		"Description":"Lan Na campaign begins."
	},
	{
		"Julian Day Number":2292774,
		"Myanmar Year":927,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Tuesday",
		"Description":"Leaves Chiang Mai for Pegu."
	},
	{
		"Julian Day Number":2292802,
		"Myanmar Year":927,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Tuesday",
		"Description":"Arrives back at Pegu."
	},
	{
		"Julian Day Number":2292872,
		"Myanmar Year":927,
		"Myanmar Month":"Second Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Thursday",
		"Description":"Begins work at the Shwemawdaw Pagoda."
	},
	{
		"Julian Day Number":2292952,
		"Myanmar Year":927,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Friday",
		"Description":"Returning troops from Lan Xang arrives back at Pegu."
	},
	{
		"Julian Day Number":2292979,
		"Myanmar Year":927,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Thursday",
		"Description":"Reconstruction of Pegu begins."
	},
	{
		"Julian Day Number":2293078,
		"Myanmar Year":927,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"Raises a new umbrella at the Shwedagon."
	},
	{
		"Julian Day Number": 2293092,
		"Myanmar Year":927,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"Raises a new umbrella at the Mahazedi (Pegu)."
	},
	{
		"Julian Day Number": 2293274,
		"Myanmar Year":928,
		"Myanmar Month":"Tawthalin",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Friday",
		"Description":"Dedicates 52 Buddha statues."
	},
	{
		"Julian Day Number": 2293358,
		"Myanmar Year":928,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"Dedicates the building housing the Pitakas at the Mahazedi."
	},
	{
		"Julian Day Number": 2293371,
		"Myanmar Year":928,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":3,
		"Day of the Week":"Thursday",
		"Description":"Leads the groundbreaking ceremony for the new gates of Pegu."
	},
	{
		"Julian Day Number": 2293546,
		"Myanmar Year":929,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Thursday",
		"Description":" Umbrella raising ceremony at the Shwemawdaw."
	},
	{
		"Julian Day Number": 2293603,
		"Myanmar Year":929,
		"Myanmar Month":"Wagung",
		"Moon Phase":"Waxing",
		"Fortnight Day":14,
		"Day of the Week":"Friday",
		"Description":"Work on the king’s house inside the new Palace begins."
	},
	{
		"Julian Day Number": 2293844,
		"Myanmar Year":929,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":4,
		"Day of the Week":"Monday",
		"Description":"Enters the new palace."
	},
	{
		"Julian Day Number": 2293904,
		"Myanmar Year":930,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Friday",
		"Description":"Learns of Ayutthaya’s rebellion."
	},
	{
		"Julian Day Number": 2293936,
		"Myanmar Year":930,
		"Myanmar Month":"First Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Tuesday",
		"Description":"Queen Atula Thiri dies."
	},
	{
		"Julian Day Number": 2294039,
		"Myanmar Year":930,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Sunday",
		"Description":"Campaign to Ayutthaya begins."
	},
	{
		"Julian Day Number": 2294240,
		"Myanmar Year":931,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":1,
		"Day of the Week":"Friday",
		"Description":"Campaign to Ayutthaya begins."
	},
	{
		"Julian Day Number": 2294247,
		"Myanmar Year":931,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"Armies leave to meet Lan Xang forces."
	},
	{
		"Julian Day Number": 2294261,
		"Myanmar Year":931,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Friday",
		"Description":"Defeats Lan Xang forces."
	},
	{
		"Julian Day Number": 2294349,
		"Myanmar Year":931,
		"Myanmar Month":"Wagung",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Tuesday",
		"Description":"Takes Ayutthaya."
	},
	{
		"Julian Day Number": 2294392,
		"Myanmar Year":931,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Wednesday",
		"Description":"Appoints Maha Thammarachathirat as king of Siam."
	},
	{
		"Julian Day Number": 2294422,
		"Myanmar Year":931,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Friday",
		"Description":"Lan Xang campaign begins."
	},
	{
		"Julian Day Number": 2294686,
		"Myanmar Year":932,
		"Myanmar Month":"Wagung",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Wednesday",
		"Description":"King of Manipur presents his daughter."
	},
	{
		"Julian Day Number": 2294984,
		"Myanmar Year":933,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Saturday",
		"Description":"Marriage of Minye Thihathu II and Min Khin Saw."
	},
	{
		"Julian Day Number": 2295225,
		"Myanmar Year":933,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Wednesday",
		"Description":"Donates to the treasure chamber of Kyaikko Pagoda."
	},
	{
		"Julian Day Number": 2295441,
		"Myanmar Year":934,
		"Myanmar Month":"Wagung",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Tuesday",
		"Description":"Donates to the treasure chamber of Kyaikko Pagoda."
	},
	{
		"Julian Day Number": 2295496,
		"Myanmar Year":934,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Monday",
		"Description":"Raises new umbrella at the Shwe Dagon."
	},
	{
		"Julian Day Number":2295601,
		"Myanmar Year":934,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Monday",
		"Description":"Thinga Dathat’s hair shaving ceremony."
	},
	{
		"Julian Day Number":2295725,
		"Myanmar Year":935,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Saturday",
		"Description":"Donates a new Buddha statue."
	},
	{
		"Julian Day Number": 2295909,
		"Myanmar Year":935,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Monday",
		"Description":"Donates a new pyathat."
	},
	{
		"Julian Day Number": 2295969,
		"Myanmar Year":935,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Friday",
		"Description":"Donates a hall at the Mahazedi."
	},
	{
		"Julian Day Number":2295988,
		"Myanmar Year":935,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"Nawrahta Minsaw weds Hsinbyshin Medaw."
	},
	{
		"Julian Day Number":2296006,
		"Myanmar Year":935,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":11,
		"Day of the Week":"Sunday",
		"Description":"Wedding day of several sons and daughters of the king."
	},
	{
		"Julian Day Number":2296234,
		"Myanmar Year":936,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Thursday",
		"Description":"Mohnyin campaign begins."
	},
	{
		"Julian Day Number":2296240,
		"Myanmar Year":936,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"Lan Xang campaign begins."
	},
	{
		"Julian Day Number":2296510,
		"Myanmar Year":937,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":12,
		"Day of the Week":"Sunday",
		"Description":"Arrives back to Pegu (from Vientiane)."
	},
	{
		"Julian Day Number":2296594,
		"Myanmar Year":937,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Saturday",
		"Description":"Campaign to Mohnyin begins."
	},
	{
		"Julian Day Number":2296878,
		"Myanmar Year":938,
		"Myanmar Month":"Second Waso",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Thursday",
		"Description":"A female white elephant arrives from Tavoy."
	},
	{
		"Julian Day Number":2296998,
		"Myanmar Year":938,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":13,
		"Day of the Week":"Friday",
		"Description":"Makes donations to the Mahazedi Pagoda."
	},
	{
		"Julian Day Number":2297050,
		"Myanmar Year":938,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Monday",
		"Description":"Stays at the royal tent west of the Mahazedi."
	},
	{
		"Julian Day Number":2297112,
		"Myanmar Year":938,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Sunday",
		"Description":"Shin Thissa marries Min Hpone Myat."
	},
	{
		"Julian Day Number":2297328,
		"Myanmar Year":939,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":3,
		"Day of the Week":"Tuesday",
		"Description":"Fugitive Mogaung Sawbwa brought before the king."
	},
	{
		"Julian Day Number":2297348,
		"Myanmar Year":939,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Friday",
		"Description":"Thinga Dathta’s hair knotting ceremony."
	},
	{
		"Julian Day Number": 2297364,
		"Myanmar Year":939,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waning",
		"Fortnight Day":10,
		"Day of the Week":"Sunday",
		"Description":"Donates a new zayat (hall)."
	},
	{
		"Julian Day Number": 2297625,
		"Myanmar Year":940,
		"Myanmar Month":"Wagung",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Wednesday",
		"Description":"New pyathat built at Pegu."
	},
	{
		"Julian Day Number": 2297775,
		"Myanmar Year":940,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waning",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"New umbrella raising ceremony at the Sandawshin at Toungoo."
	},
	{
		"Julian Day Number":2297787,
		"Myanmar Year":940,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Wednesday",
		"Description":"Receives news of death of Maha Dewi of Lan Na."
	},
	{
		"Julian Day Number":2297816,
		"Myanmar Year":940,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Wednesday",
		"Description":"Nawrahta Minsaw appointed viceroy of Lan Na."
	},
	{
		"Julian Day Number":2297891,
		"Myanmar Year":941,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Monday",
		"Description":"Donation ceremony at Mahazedi."
	},
	{
		"Julian Day Number":2297970,
		"Myanmar Year":941,
		"Myanmar Month":"Second Waso",
		"Moon Phase":"Waxing",
		"Fortnight Day":10,
		"Day of the Week":"Thursday",
		"Description":"Nawrahta Minsaw’s coronation ceremony at Chiang Mai."
	},
	{
		"Julian Day Number":2298260,
		"Myanmar Year":942,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Sunday",
		"Description":"Bayinnaung dedicates the treasure chamber of Kaung-mhu-daw Mahamuni Pagoda."
	},
	{
		"Julian Day Number":2298543,
		"Myanmar Year":942,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"Umbrella (hti) raising ceremony at a pagoda."
	},
	{
		"Julian Day Number":2298548,
		"Myanmar Year":942,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waning",
		"Fortnight Day":12,
		"Day of the Week":"Wednesday",
		"Description":"City of Kale fortified."
	},
	{
		"Julian Day Number":2298557,
		"Myanmar Year":942,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Wednesday",
		"Description":"Shin Thissa appointed governor of Nyaungyan."
	},
	{
		"Julian Day Number":2298642,
		"Myanmar Year":943,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":3,
		"Day of the Week":"Thursday",
		"Description":"Receives Mohnyin Sawbwa."
	},
	{
		"Julian Day Number":2298645,
		"Myanmar Year":943,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Sunday",
		"Description":"Receives Chaing Rai Sawbwa."
	},
	{
		"Julian Day Number":2298664,
		"Myanmar Year":943,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Waning",
		"Fortnight Day":10,
		"Day of the Week":"Friday",
		"Description":"Appoints Thinga Dathta viceroy of Martaban."
	},
	{
		"Julian Day Number":2298801,
		"Myanmar Year":943,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Tuesday",
		"Description":"Bayinnaung dies."
	},
	{
		"Julian Day Number":2299305,
		"Myanmar Year":944,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Tuesday",
		"Description":"A comet going across the Sun observed."
	},
	{
		"Julian Day Number":2299718,
		"Myanmar Year":946,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Tuesday",
		"Description":"Nanda marches to Ava."
	},
	{
		"Julian Day Number":2300003,
		"Myanmar Year":946,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":5,
		"Day of the Week":"Sunday",
		"Description":"Nanda dedicates a Bronze Buddha statue."
	},
	{
		"Julian Day Number":2300030,
		"Myanmar Year":946,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":3,
		"Day of the Week":"Saturday",
		"Description":"Nanda dedicates five Buddha statues (hence known as Nga-Zu-Dayaka Min)."
	},
	{
		"Julian Day Number":2300626,
		"Myanmar Year":948,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Sunday",
		"Description":"Siam campaign begins."
	},
	{
		"Julian Day Number":2301198,
		"Myanmar Year":950,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"Marriage between Minye Kyawhtin and Princess Thakin Gyi."
	},
	{
		"Julian Day Number":2301477,
		"Myanmar Year":950,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Thursday",
		"Description":"Appoints Thado Dhamma Yaza III viceroy of Prome."
	},
	{
		"Julian Day Number":2302834,
		"Myanmar Year":954,
		"Myanmar Month":"Nadaw",
		"Moon Phase":"Waxing",
		"Fortnight Day":2,
		"Day of the Week":"Wednesday",
		"Description":"5th invasion of Siam begins."
	},
	{
		"Julian Day Number":2302899,
		"Myanmar Year":954,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"Mingyi Swa dies in action."
	},
	{
		"Julian Day Number":2303254,
		"Myanmar Year":955,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":8,
		"Day of the Week":"Wednesday",
		"Description":"Appoints Minye Kyawswa II of Ava heir-apparent."
	},
	{
		"Julian Day Number":2303254,
		"Myanmar Year":956,
		"Myanmar Month":"Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":13,
		"Day of the Week":"Friday",
		"Description":"Palace struck by lightning."
	},
	{
		"Julian Day Number":2304111,
		"Myanmar Year":958,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waxing",
		"Fortnight Day":9,
		"Day of the Week":"Sunday",
		"Description":"Queen Min Phyu dies."
	},
	{
		"Julian Day Number":2304545,
		"Myanmar Year":959,
		"Myanmar Month":"Waso",
		"Moon Phase":"New moon",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"Nyaungyan takes Yamethin."
	},
	{
		"Julian Day Number":2304565,
		"Myanmar Year":959,
		"Myanmar Month":"Wagaung",
		"Moon Phase":"Waning",
		"Fortnight Day":5,
		"Day of the Week":"Friday",
		"Description":"Nyaungyan takes Pagan."
	},
	{
		"Julian Day Number":2304591,
		"Myanmar Year":959,
		"Myanmar Month":"Tawthalin",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Wednesday",
		"Description":"Nyaungyan moves into Ava Palace."
	},
	{
		"Julian Day Number":2304610,
		"Myanmar Year":959,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waxing",
		"Fortnight Day":6,
		"Day of the Week":"Monday",
		"Description":"Thado Dhamma Yaza III assassinated."
	},
	{
		"Julian Day Number":2304893,
		"Myanmar Year":960,
		"Myanmar Month":"First Waso",
		"Moon Phase":"Waning",
		"Fortnight Day":9,
		"Day of the Week":"Thursday",
		"Description":"Nyaungyan orders new construction works at Ava. (Small leap year in Ava)"
	},
	{
		"Julian Day Number":2305435,
		"Myanmar Year":961,
		"Myanmar Month":"Pyatho",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Sunday",
		"Description":"Nanda surrenders to Toungoo and Arakan."
	},
	{
		"Julian Day Number":2305492,
		"Myanmar Year":961,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":2,
		"Day of the Week":"Monday",
		"Description":"Minye Thihathu returns to Toungoo."
	},
	{
		"Julian Day Number":2305574,
		"Myanmar Year":962,
		"Myanmar Month":"Kason",
		"Moon Phase":"Waning",
		"Fortnight Day":10,
		"Day of the Week":"Saturday",
		"Description":"Siamese forces retreat from Toungoo."
	},
	{
		"Julian Day Number":2305819,
		"Myanmar Year":962,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Saturday",
		"Description":"Nyaungyan begins campaign to Nyaungshwe."
	},
	{
		"Julian Day Number":2306211,
		"Myanmar Year":963,
		"Myanmar Month":"Tabodwe",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Saturday",
		"Description":"Nyaungyan visits Shwethalyaung Pagoda."
	},
	{
		"Julian Day Number":2306232,
		"Myanmar Year":963,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Sunday",
		"Description":"Campaign to Bhamo begins."
	},
	{
		"Julian Day Number":2306629,
		"Myanmar Year":964,
		"Myanmar Month":"Late Tagu",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Friday",
		"Description":"Donates labor at the Sandamuni Pagoda, Ava."
	},
	{
		"Julian Day Number":2306861,
		"Myanmar Year":965,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":12,
		"Day of the Week":"Saturday",
		"Description":"Donates to the relic chamber of the Sandamuni."
	},
	{
		"Julian Day Number":2307344,
		"Myanmar Year":966,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":8,
		"Day of the Week":"Friday",
		"Description":"Donates to the relic chamber of the Sandamuni."
	},
	{
		"Julian Day Number":2307349,
		"Myanmar Year":966,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":13,
		"Day of the Week":"Wednesday",
		"Description":"Dedicates a steele at the pagoda."
	},
	{
		"Julian Day Number":2307476,
		"Myanmar Year":967,
		"Myanmar Month":"Wagaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":7,
		"Day of the Week":"Thursday",
		"Description":"Holds court about invasion of Hsenwi, Hsipaw and Mong Mit."
	},
	{
		"Julian Day Number":2307779,
		"Myanmar Year":968,
		"Myanmar Month":"Nayon",
		"Moon Phase":"Full moon",
		"Fortnight Day":15,
		"Day of the Week":"Saturday",
		"Description":"Anaukpetlun holds new umbrella raising ceremony at the Sandamuni ."
	},
	{
		"Julian Day Number":2308080,
		"Myanmar Year":968,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":6,
		"Day of the Week":"Saturday",
		"Description":"Builds monastery for the Bame Sayadaw."
	},
	{
		"Julian Day Number":2308299,
		"Myanmar Year":969,
		"Myanmar Month":"Tazaungmon",
		"Moon Phase":"Waxing",
		"Fortnight Day":4,
		"Day of the Week":"Monday",
		"Description":"Prome campaign begins."
	},
	{
		"Julian Day Number":2308572,
		"Myanmar Year":970,
		"Myanmar Month":"Wagaung",
		"Moon Phase":"Waxing",
		"Fortnight Day":11,
		"Day of the Week":"Monday",
		"Description":"Anaukpetlun takes Prome."
	},
	{
		"Julian Day Number":2308637,
		"Myanmar Year":970,
		"Myanmar Month":"Thadingyut",
		"Moon Phase":"Waning",
		"Fortnight Day":2,
		"Day of the Week":"Wednesday",
		"Description":"Returns to Ava."
	},
	{
		"Julian Day Number":2308783,
		"Myanmar Year":970,
		"Myanmar Month":"Tabaung",
		"Moon Phase":"Waning",
		"Fortnight Day":1,
		"Day of the Week":"Tuesday",
		"Description":"Atula Sanda Dewi becomes chief queen."
	}
	];
}	
//End of chronicle ######################################################

} //ceMmChronicle
//-------------------------------------------------------------------------
