// MECHANISM OF INTERACTION (Version 1.35)
// * These functions implement a 2-way communication between the plugin
// * Chemscape Chime and Javascript.
// * aangepaste versie met /wetche/1atom.pdb als padnaam
// VARIABLES IN THE TOP FRAMESET

	top.moi = new Array()
	top.moi["codeversion"] = "1.35"

	top.CSX1 = "script <exiting>"
	top.CSX2 = "Chime script completed."
	top.EOS = "#@-End-Of-Script-@"
	top.INTERRUPT = "*** Script interrupted ***"

	top.moi["init"] = new Array()
	top.moi["initiated"] = false
	top.moi["codeloc"] = "top"
	spt_array = new Array()
	win = self
	while (win != win.parent)
	{
		top.moi["codeloc"] += "." + win.name
		win = win.parent
	}

top.moi["nav"] = 0
if (navigator.appName.toLowerCase().indexOf("netscape") == 0) {top.moi["nav"] = 1}
if (navigator.appName.toLowerCase().indexOf("microsoft") != -1) {top.moi["nav"] = 2}
if (navigator.userAgent.toLowerCase().indexOf("opera") != -1) {top.moi["nav"] = 3}
top.moi["ver"] = parseInt(navigator.appVersion)
if (top.moi["nav"] == 1 && top.moi["ver"] > 4) {top.moi["ver"] = parseInt(navigator.userAgent.substring(navigator.userAgent.toLowerCase().lastIndexOf('netscape') + 9))}
if (top.moi["nav"] == 2 && top.moi["ver"] >= 4) {top.moi["ver"] = parseInt(navigator.userAgent.substring(navigator.userAgent.toLowerCase().lastIndexOf('msie ') + 5))}
if (top.moi["nav"] == 3) {top.moi["ver"] = parseInt(navigator.userAgent.substring(navigator.userAgent.toLowerCase().lastIndexOf('opera ') + 6))}
top.moi["os"] = 0
if (navigator.appVersion.toLowerCase().indexOf("win") != -1) {top.moi["os"] = 1}
if (navigator.appVersion.toLowerCase().indexOf("mac") != -1) {top.moi["os"] = 2}
ib = -1
for (ia = 0; ia < navigator.plugins.length; ia++)
{
	ic = escape(navigator.plugins[ia].name.toLowerCase())
	if (ic.indexOf("chemscape%20chime") != -1 || ic.indexOf("mdl%AE%20chime") != -1) {ib = ia;break}
}
if (ib == -1) {top.moi["chi"] = 0}
else
{
	top.moi["chi"] = 1
	if (ic.indexOf("%202.") != -1)
	{
		top.moi["chi"] = 2
		if (ic.indexOf("%202.6") != -1) {top.moi["chi"] = 3}
		if (ic.indexOf("sp4") != -1) {top.moi["chi"] = 4}
	}
}

top.moi["works"] = 0
if (top.moi["ver"] == 4 && top.moi["nav"] == 1 && top.moi["chi"] >= 2)
{
	top.moi["works"] = 1
}
if (top.moi["ver"] >= 4 && top.moi["nav"] == 2 && top.moi["os"] == 1)
{
	top.moi["works"] = 2
}
if (top.moi["ver"] == 7 && top.moi["nav"] == 1 && top.moi["chi"] >= 2)
{
	top.moi["works"] = 3
}

top.moi_verbosemode = false
top.moi_chimebusy = ""
top.moi_downloadmanager = true
top.moi_load_local = 5
top.moi_load_http = 45
top.moi_load_confirm = "The file you requested (%FILE%) has not downloaded yet in %TIME% seconds.\n\n"
if (top.moi["works"] == 2) {top.moi_load_confirm += "Chemscape Chime 2.6 SP4 in Internet Explorer:\nThe Chime plug-in automatically alerts you if the download failed. If so, close the alert message before answering this question. If not, watch the status line of your browser to know whether or not the molecule is still downloading.\n\nDo you wish to give more time for this file to download?"}
else {top.moi_load_confirm += "If a file takes a too long time to download, it might be a sign that an error occured in the meantime.\nYou can watch the status line of your browser to know whether or not the molecule is still downloading.\n\nDo you wish to give more time for this file to download?"}
top.moi_ready_delay = 2
top.moi_ready_confirm = true
top.moi_htmlstring = "<TABLE BORDER=0 CELLSPACING=0 CELLPADDING=0 HEIGHT='%HEIGHT%' WIDTH='%WIDTH%'><TR><TD></TD></TR></TABLE>"

function correct(name)
{
	ll = 0
	while (ll < name.length)
	{
		letter = name.charAt(ll).toLowerCase()
		if ("_abcdefghijklmnopqrstuvwxyz0123456789".indexOf(letter) == -1)
		{
			name = name.substring(0,ll) + name.substring(ll + 1,name.length)
		}
		else
		{
			ll++
		}
	}
	return(name)
}

function gentlename(name)
{
	ii = 0
	while (ii < top.moi.length)
	{
		if (name == top.moi[top.moi[ii]]["gentlename"]) {return top.moi[ii]}
		ii++
	}
	return(name)
}

function exists(pin)
{//debug_call("exists",Array(pin,"pin"))
	ee = true
	if (!top.moi["works"]) {ee = false}
	if (ee && typeof(top.moi[pin]) != 'object') {ee = false}
	if (ee && top.moi["works"] == 1)
	{
		ee = (typeof(eval(top.moi[pin]["window"] + ".document." + pin)) == "object"
		&& typeof(eval(top.moi[pin]["window"] + ".document." + pin + ".executeScript")) == "function")
	}
	if (ee && top.moi["works"] > 1)
	{
		yy = (eval(top.moi[pin]["window"] + ".document.embeds.length"))
		ee = false
		for (xx=0; xx < yy; xx++) if (eval(top.moi[pin]["window"] + ".document.embeds[" + xx + "].name") == top.moi[pin]["gentlename"]) ee = true
	}
	if (ee && top.moi["works"] > 1)
	{
		ee = (typeof(eval(top.moi[pin]["window"] + ".ifr_" + pin)) != 'undefined')
	}
	if (ee)
	{
		return true
	}
	else
	{
		reset_chime(pin)
		return false
	}
}

// INPUT AND OUTPUT FUNCTIONS

function input_script(pin,spt)
{
	pin = correct(pin.toLowerCase())
	if (!top.moi["initiated"]) {init_stack(new Array("input_script",pin,spt));return}
	if (!exists(pin)) {return}
	sendscript(pin,spt)
}

function input_load(pin,mol,loadtime,spt)
{
	pin = correct(pin.toLowerCase())
	if (!top.moi["initiated"]) {init_stack(new Array("input_load",pin,mol,loadtime,spt));return}
	if (!exists(pin)) {return}
	if (typeof(loadtime) != 'undefined' && loadtime != "")
	{
		top.moi[pin]["loadtime"] = loadtime
	}
	else
	{
		if ((eval(top.moi[pin]["window"]).location + "").indexOf("http://") != -1 || mol.indexOf("http://") != -1)
		{
			top.moi[pin]["loadtime"] = top.moi_load_http
		}
		else
		{
			top.moi[pin]["loadtime"] = top.moi_load_local
		}
	}
	if (typeof(spt == 'undefined') || spt == "")
	{
		spt = "load " + mol + " #req"
	}
	else
	{
		spt += ";load " + mol + " #req"
	}
	top.moi[pin]["load_count"] = top.moi[pin]["loadtime"] * 2
	OutputLoad(pin,0)
	setTimeout("test_load('" + pin + "',0)",500)
	sendscript(pin,spt)
}

function input_both(pin,mol,spt)
{
	pin = correct(pin.toLowerCase())
	if (!top.moi["initiated"]) {init_stack(new Array("input_both",pin,mol,spt));return}
	if (!exists(pin)) {return}
	if (mol != top.moi[pin]["last_loaded"])
	{
		set_waiting_script(pin,spt)
		input_load(pin,mol)
	}
	else
	{
		sendscript(pin,spt)
	}
}

function setOutput(pin,output,func)
{
	pin = correct(pin.toLowerCase())
	if (!top.moi["initiated"]) {init_stack(new Array("setOutput",pin,output,func));return}
	if (!exists(pin)) {return}
	if (typeof(func) == "function")
	{
		top.moi[pin]["Output" + output] = func
	}
}

function OutputReady(pin,ready) {
if (ready) {setTimeout('top.status = "The ChemScape Chime plug-in \'' + pin + '\' is ready."',1000)}
else {top.status = "The ChemScape Chime plug-in '" + pin + "' is busy."}
if (typeof(top.moi[pin]["OutputReady"]) == "function") top.moi[pin]["OutputReady"](pin,ready)}

function OutputPick(pin,msg) {
if (typeof(top.moi[pin]["OutputPick"]) == "function") top.moi[pin]["OutputPick"](pin,msg)}

function OutputLoad(pin,state) {
if (typeof(top.moi[pin]["OutputLoad"]) == "function") top.moi[pin]["OutputLoad"](pin,state)}

function OutputMsg1(pin,msg,mno) {
if (typeof(top.moi[pin]["OutputMsg1"]) == "function") top.moi[pin]["OutputMsg1"](pin,msg,mno)}

function OutputMsg2() {}

function OutputMsg3(pin,msg,mno) {
if (typeof(top.moi[pin]["OutputMsg3"]) == "function") top.moi[pin]["OutputMsg3"](pin,msg,mno)}

// FUNCTIONS THAT DEFINE THE CHIME ARRAY AND THAT WRITE THE EMBED TAGS

function define_chime(what,pin,height,width,otherprop,mol,spt,htmlstring)
{
	pin = correct(pin.toLowerCase())
	if (typeof(top.moi[pin]) != 'undefined' || !top.moi["works"])
	{
		draw_htmlstring(what,pin,height,width,otherprop,mol,spt,htmlstring)
		return
	}
	top.moi[pin] = new Array()
	top.moi[top.moi.length] = pin
	top.moi[pin]["gentlename"] = pin
	if (typeof(what) != "object") what = window
	top.moi[pin]["window"] = "top"
	win = what
	while (win != win.parent)
	{
		top.moi[pin]["window"] += "." + win.name
		win = win.parent
	}
	if (top.moi["works"] > 1)
	{
		cookies = " " + what.document.cookie + ";"
		var ss0 = cookies.indexOf(" MoI" + pin + "=")
		if (ss0 != -1)
		{
			ss0 += 5 + pin.length
			ss1 = cookies.indexOf(";",ss0)
			top.moi[pin]["cookie"] = eval(unescape(cookies.substring(ss0,ss1)))
		}
		else
		{
			top.moi[pin]["cookie"] = 0
		}
		what.document.cookie = "MoI" + pin + "=" + (top.moi[pin]["cookie"] + 1)
		top.moi[pin]["gentlename"] = what.location + ""
		top.moi[pin]["gentlename"] = correct(unescape(top.moi[pin]["gentlename"]).toLowerCase()) + pin + top.moi[pin]["cookie"]
		top.moi[pin]["gentlename"] = top.moi[pin]["gentlename"].substring(top.moi[pin]["gentlename"].length - 32,top.moi[pin]["gentlename"].length)
	}
	top.moi[pin]["last_loaded"] = "1atom.pdb"
	reset_chime(pin)
	write_chime(what,pin,height,width,otherprop)
	if (typeof(mol) != 'undefined' && mol != '')
	{
		if (typeof(spt) != 'undefined' && spt != '')
		{
			init_stack(new Array("input_both",pin,mol,spt))
		}
		else
		{
			init_stack(new Array("input_load",pin,mol))
		}
	}
	else
	{
		if (typeof(spt) != 'undefined' && spt != '')
		{
			init_stack(new Array("input_both",pin,"1atom.pdb",spt))
		}
		else
		{
			init_stack(new Array("input_load",pin,"1atom.pdb"))
		}
	}
}

function init_stack(func)
{
	if (!top.moi["initiated"])
	{
		if (func[0] == 'setOutput')
		{
			xx = top.moi["init"].length;ii = 0
			while (xx > 0)
			{
				top.moi["init"][xx] = top.moi["init"][xx - 1]
				xx--
			}
			top.moi["init"][0] = func
		}
		else {top.moi["init"][top.moi["init"].length] = func}
	}
}

function init_chime()
{
	top.moi["initiated"] = true
	next = 0; ii = top.moi["init"].length
	while (next < ii)
	{
		tc = top.moi["codeloc"] + "." + top.moi["init"][next][0] + "("
		tcx = 1; tci = top.moi["init"][next].length
		while (tcx < tci) {
		if (typeof(top.moi["init"][next][tcx]) != "string") {tc += "top.moi['init'][" + next + "][" + tcx + "],"}
		else {tc += "'" + top.moi["init"][next][tcx].replace(/'/g,"\\'") + "',"}
		tcx++
		}
		tc = tc.substring(0,tc.length - 1) + ")"
		setTimeout(tc,5 + 100*next)
		next++
	}
}

function write_chime(what,pin,height,width,otherprop)
{
	t  = '<embed src="/wetche/1atom.pdb" frank="no" pluginspage="http://www.mdlchime.com" '
	t += 'name="' + top.moi[pin]["gentlename"] + '" '
	t += 'height="' + height + '" width="' + width + '" '
	t += 'debugscript=on MessageCallback="' + top.moi["codeloc"] + '.ChimeMessage" PickCallback="' + top.moi["codeloc"] + '.ChimePick" '
	if (typeof(otherprop) != 'undefined' && otherprop != '') t += otherprop
	t += '>'
	if (top.moi["works"] > 1)
	{
		t += '<IFRAME NAME="ifr_' + pin + '" ALIGN=TOP WIDTH=5 HEIGHT=0 VSPACE=0 HSPACE=0 SCROLLING="no" FRAMEBORDER="no"></IFRAME>'
	}
	what.document.write(t)
}

function draw_htmlstring(what,pin,height,width,otherprop,mol,spt,htmlstring)
{
    if (typeof(htmlstring) == 'undefined') htmlstring = top.moi_htmlstring
	htmlstring = htmlstring.replace(/%EMBEDNAME%/gi,pin).replace(/%HEIGHT%/gi,height).replace(/%WIDTH%/gi,width).replace(/%OTHERPROP%/gi,otherprop).replace(/%SCRIPT%/gi,spt).replace(/%MOL%/gi,mol)
	what.document.write(htmlstring)
}

function reset_chime(pin)
{
	if (typeof(top.moi[pin]) != 'object') {return}
	top.moi[pin]["busy"] = false
	top.moi[pin]["busy_count"] = 0
	top.moi[pin]["pick_msg"] = ""
	top.moi[pin]["pick_mno"] = ""
	top.moi[pin]["pick_not"] = false
	top.moi[pin]["msg_count"] = 0
	top.moi[pin]["msg_dis_count"] = 0
	top.moi[pin]["highest_mno_seen"] = -1
	top.moi[pin]["gap_tot"] = 0
	top.moi[pin]["gap_top"] = new Array()
	top.moi[pin]["gap_top_orig"] = new Array()
	top.moi[pin]["gap_bottom"] = new Array()
	top.moi[pin]["last_mno_in_order"] = -1
	top.moi[pin]["stacked_msg"] = new Array()
	top.moi[pin]["last_mno_passed"] = -1
	top.moi[pin]["eos_mno"] = -1
	top.moi[pin]["eos_msg"] = ""
	top.moi[pin]["highest_automodel_mno_seen"] = 0
	top.moi[pin]["last_auto_model_number"] = -1
	top.moi[pin]["pass_messages"] = true
	top.moi[pin]["last_pass"] = false
	top.moi[pin]["fstak"] = new Array()
	top.moi[pin]["spt_array"] = new Array()
	top.moi[pin]["spt_i"] = 0
	top.moi[pin]["r_from_fstak"] = false
	top.moi[pin]["requesting"] = false
	top.moi[pin]["testing"] = 0
	top.moi[pin]["functocall"] = ""
}


// FUNCTIONS THAT SENDS COMMANDS TO CHIME

function sendscript(pin,spt,showmsg,mode)
{
	pin = correct(pin.toLowerCase())
	if (!exists(pin)) {return}
	if (typeof(mode) == 'undefined')
	{
		mode = 0
	}
	if (top.moi[pin]["busy"] && mode == 0)
	{
		set_waiting_script(pin,spt,showmsg)
		return
	}
	script = spt.replace(/\|/g,";")
	script = spt.replace(/\n/g,";")
	script = spt.replace(/ ;/g,";")
	script = spt.replace(/; /g,";")
	script = spt.replace(/"/g,"'")
	script = spt.replace(/'/g,"\\'")
	while ((top.moi["nav"] == 2 || top.moi["chi"] == 1 || top.moi["chi"] == 2) && spt.toLowerCase().indexOf("show pdbheader") != -1)
	{
		ss = spt.toLowerCase().indexOf("show pdbheader")
		spt = spt.substring(0,ss) + spt.substring((spt + ";").indexOf(";",ss) + 1,spt.length + 1)
	}
	if ((top.moi_downloadmanager || top.moi["works"] == 2) && spt.indexOf("#req") == -1)
	{
		ff1 = (";" + spt.toLowerCase()).indexOf(";load")
		ff2 = (";" + spt.toLowerCase()).indexOf(";script")
		ff3 = -1
		if (ff1 != -1 || ff2 != -1)
		{
			if (ff1 == -1) {ff1 = spt.length}
			if (ff2 == -1) {ff2 = spt.length}
			if (ff1 < ff2)
			{
				ff3 = (spt + ";").indexOf(";",ff1)
				if (top.moi_downloadmanager)
				{
					mol = spt.substring(ff1 + 5,ff3)
					front = spt.substring(0,ff1 - 1)
					rear = spt.substring(ff3 + 1,spt.length)
					input_load(pin,mol,"",front)
					if (rear != "") {set_waiting_script(pin,rear,showmsg)}
					return
				}
			}
			else
			{
				ff3 = (spt + ";").indexOf(";",ff2)
			}
			if (top.moi["works"] == 2)
			{
					front = spt.substring(0,ff3) + " #req"
					rear = spt.substring(ff3 + 1,spt.length)
					if (rear != "") {set_waiting_script(pin,rear,showmsg)}
					un_sendscript(pin,front)
					return			
			}
		}
	}

	if (typeof(showmsg) != 'undefined') if (!showmsg)
	{
		spt = "#<pass;" + spt
		if (top.moi["works"] == 2)
		{
			spt += ";#>pass"
		}
	}
	else if (!top.moi_verbosemode)
	{
		spt = "#<pass;" + spt
		if (top.moi["works"] == 2)
		{
			spt += ";#>pass"
		}
	}
	un_sendscript(pin,spt,mode)
}

function un_sendscript(pin,spt,mode)
{
	if (mode == 0) {do_busy(true,pin)}
	if (mode == 0 && (top.moi["works"] != 2 || (top.moi["works"] == 2 && spt.indexOf("#req") == -1)))
	{
		spt = spt + ";" + top.EOS
	}
	if (top.moi["works"] == 2 && spt.indexOf("#req") != -1)
	{
		top.moi[pin]["requesting"] = true
	}
	spt = spt.replace(/ #req/gi,"")
	if ((";" + spt).indexOf(";load") != -1)
	{
		top.moi[pin]["last_loaded"] = (";" + spt).substring((";" + spt).lastIndexOf(";load") + 6,(";" + spt + ";").indexOf(";",(";" + spt).lastIndexOf(";load") + 1))
	}
	if (top.moi["works"] == 1)
	{
		setTimeout(top.moi[pin]["window"] + ".document." + pin + ".executeScript('" + spt + "')",5)
	}
	if (top.moi["works"] > 1)
	{
		with(eval(top.moi[pin]["window"] + ".ifr_" + pin + ".document"))
		{
			write('<HTML><BODY><EMBED TYPE="application/x-spt" WIDTH=0 HEIGHT=0 BUTTON=push TARGET="' + top.moi[pin]["gentlename"] + '" SCRIPT="' + spt + '" IMMEDIATE=1></BODY></HTML>')
		}
	}
}

// FUNCTIONS THAT RECEIVE MESSAGES FROM CHIME

function ChimePick(pin,msg)
{
	pin = gentlename(pin)
	OutputPick(pin,msg)
	if (top.moi[pin]["pick_msg"] != "")
	{
		top.moi[pin]["pick_msg"] = ""
		top.moi[pin]["pick_mno"] = ""
	}
}

function ChimeMessage(pin,msg,mno)
{
	pin = gentlename(pin)
	OutputMsg3(pin,msg,mno)
	mno = parseInt(mno)

	if (!top.moi[pin]["pick_not"])
	{
		if (top.moi[pin]["pick_msg"] != "") 
		{ 
			top.moi[pin]["pick_not"] = true; 
			ChimeMessage(pin,top.moi[pin]["pick_msg"],top.moi[pin]["pick_mno"])
			top.moi[pin]["pick_msg"] = ""
		}
		if (msg.substring(0,4) == "Atom" ||
			msg.substring(0,14) == "Rotating about") 
		{ 
			top.moi[pin]["pick_msg"] = msg
			top.moi[pin]["pick_mno"] = mno
			return
		}
	}
	else {top.moi[pin]["pick_not"] = false}

	if (msg == "select selected #test")
	{
		top.moi[pin]["testing"] = 2
	}
	if (top.moi[pin]["testing"] == 2 && msg.indexOf(" selected!") == msg.length - 10)
	{
		top.moi[pin]["testing"] = 3
	}

	if (top.moi["works"] == 1 && top.moi[pin]["last_pass"])
	{
		if (mno == 0)
		{
			top.moi[pin]["last_pass"] = false
		}
		else
		{
			return
		}
	}
	if (msg == "#>pass")
	{
		top.moi[pin]["pass_messages"] = true
		top.moi[pin]["last_pass"] = true
		return
	}
	if (msg == "#<pass")
	{
		top.moi[pin]["pass_messages"] = false
	}

	if ((msg == top.CSX1 || msg == top.CSX2) && !top.moi[pin]["pass_messages"] && top.moi["works"] > 1)
	{
		finishMessage(pin,msg,mno)
		return
	}

	if ((msg == top.EOS || msg == top.INTERRUPT) && ((top.moi[pin]["last_pass"] && top.moi["works"] == 2) || top.moi["works"] != 2))
	{
		top.moi[pin]["last_pass"] = false
		if (top.moi["works"] == 1 && !top.moi[pin]["pass_messages"]) {top.moi[pin]["last_pass"] = true}
		top.moi[pin]["pass_messages"] = true
		finishMessage(pin,msg,mno)
		reset_unscramble(pin)
		return
	}

	if (!top.moi[pin]["pass_messages"])
	{
		set_timeout(pin,1)
		return
	}
	top.moi[pin]["last_pass"] = false

	if (msg == top.CSX1 || msg == top.CSX2)
	{
		if (top.moi[pin]["last_mno_in_order"] == -1) {return}
	}
	else
	{
		set_timeout(pin,1)
	}

	if (msg == top.EOS || msg == top.INTERRUPT)
	{
		top.moi[pin]["eos_mno"] = mno
		top.moi[pin]["eos_msg"] = msg
	}

	if (!gaps_open(pin) && mno == 0 && top.moi[pin]["last_mno_in_order"] != -1)
	{
		reset_unscramble(pin)
	}
	if (mno > 3 && !gaps_open(pin) && top.moi[pin]["last_mno_in_order"] == -1)
	{
		finishMessage(pin,msg,mno)
		return
	}
	if (gaps_open(pin))
	{
		if (mno > top.moi[pin]["highest_mno_seen"])
		new_gap(mno,pin)
		else for (gg = 1; gg <= top.moi[pin]["gap_tot"]; gg++)
		{
			if (mno == (top.moi[pin]["gap_tot"][gg] - 1))
			{
				top.moi[pin]["gap_tot"][gg] = mno
				return
			}
		}
		top.moi[pin]["stacked_msg"][mno] = msg
		
		next = top.moi[pin]["last_mno_passed"] + 1
		if (next < top.moi[pin]["eos_mno"])
		{
			while (typeof(top.moi[pin]["stacked_msg"][next]) != "undefined")
			{
				if (top.moi[pin]["stacked_msg"][next] != ("P@-" + next + "-@"))
				{
					finishMessage(pin,top.moi[pin]["stacked_msg"][next],next)
					top.moi[pin]["stacked_msg"][next] = ("P@-" + next + "-@")
					next++
					if (next >= top.moi[pin]["eos_mno"]) {break}
				}
				else break
			}
			top.moi[pin]["last_mno_passed"] = next - 1
		}
		
		if (!gaps_open(pin))
		{
			top.moi[pin]["last_mno_in_order"] = top.moi[pin]["highest_mno_seen"]
			if (top.moi[pin]["eos_mno"] != -1 && top.moi[pin]["highest_mno_seen"] >= top.moi[pin]["eos_mno"]) 
			{
					finishMessage(pin,top.moi[pin]["eos_msg"],top.moi[pin]["eos_mno"])
					reset_unscramble(pin)
			}
		}
	}
	else if (mno == (top.moi[pin]["last_mno_in_order"] + 1)) 
	{
		top.moi[pin]["last_mno_in_order"] = mno
		top.moi[pin]["highest_mno_seen"] = mno
		if (top.moi[pin]["eos_mno"] != -1) 
		{
			finishMessage(pin,top.moi[pin]["eos_msg"],top.moi[pin]["eos_mno"])
			reset_unscramble(pin)
		}
		else
		{
			top.moi[pin]["last_mno_passed"] = mno
			finishMessage(pin,msg,mno); 
		}
	}
	else if (mno > (top.moi[pin]["last_mno_in_order"] + 1)) 
	{
		new_gap(mno,pin)
			top.moi[pin]["stacked_msg"][mno] = msg
	}
}

// FUNCTIONS NEEDED FOR UNSCRAMBLING

function new_gap(mno,pin)
{
	gapi = top.moi[pin]["gap_tot"] + 1
	bottom = top.moi[pin]["highest_mno_seen"] + 1

	top.moi[pin]["highest_mno_seen"] = mno; 

	top.moi[pin]["gap_top"][gapi] = mno; 
	top.moi[pin]["gap_top_orig"][gapi] = mno
	top.moi[pin]["gap_bottom"][gapi] = bottom; 
	top.moi[pin]["gap_tot"]++

}

function gaps_open(pin)
{
	if (top.moi[pin]["gap_tot"] == 0)
		return false
	for(gg = 1; gg <= top.moi[pin]["gap_tot"]; gg++)
	{
		if (top.moi[pin]["gap_tot"][gg] > top.moi[pin]["gap_bottom"][gg])
			return true
	}
	return false
}

function reset_unscramble(pin)
{
	top.moi[pin]["gap_tot"] = 0
	top.moi[pin]["last_mno_in_order"] = -1
	top.moi[pin]["last_mno_passed"] = -1
	top.moi[pin]["highest_mno_seen"] = -1
	top.moi[pin]["eos_mno"] = -1
	top.moi[pin]["eos_msg"] = ""
	top.moi[pin]["stacked_msg"] = new Array()
}

function finishMessage(pin,msg,mno)
{
	if (msg == top.EOS || msg == top.INTERRUPT)
	{
		top.moi[pin]["pass_messages"] = true
		do_busy(false,pin)
		return
	}
	if (msg == top.CSX1 || msg == top.CSX2)
	{
		if (top.moi["works"] == 2 && top.moi[pin]["requesting"])
		{
			top.moi[pin]["requesting"] = false
			do_busy(false,pin)
		}
		return
	}
	OutputMsg1(pin,msg,mno)
}

// FUNCTIONS THAT TEST THE RESPONSE OF CHIME

function do_busy(bb,pin)
{
	if (bb)
	{
		top.moi[pin]["busy_count"]++
		if (top.moi[pin]["busy_count"] > 0)
		{
			top.moi[pin]["busy"] = true
			set_timeout(pin,1)
			if (!top.moi[pin]["r_from_fstak"])
			{
				OutputReady(pin,false)
			}
		}
	}
	else
	{
		top.moi[pin]["busy_count"]--
		if (top.moi[pin]["busy_count"] <= 0)
		{
			top.moi[pin]["busy"] = false
			top.moi[pin]["busy_count"] = 0
			set_timeout(pin,0)
			if (typeof(top.moi[pin]["fstak"][0]) == "function")
			{
				top.moi[pin]["r_from_fstak"] = true
				do_waiting_sptfunc(pin)
			}
			else
			{
				top.moi[pin]["r_from_fstak"] = false
				OutputReady(pin,true)
			}
		}
	}
}

function set_timeout(pin,bb)
{
	if (top.moi_ready_confirm == false) {return}
	if (typeof(top.moi[pin]["to_ready"]) != 'undefined')
	{
		clearTimeout(top.moi[pin]["to_ready"])
		if (bb == 0 || top.moi[pin]["testing"] != 0) {return}
	}
	if (bb == 1) {givemoretime = true}
	else
	{
		if (top.moi_ready_confirm != true) {givemoretime = confirm(top.moi_ready_confirm.replace(/%TIME%/gi,top.moi_ready_delay))}
		else givemoretime = false
	}
	if (givemoretime)
	{
		top.moi[pin]["to_ready"] = setTimeout('set_timeout("' + pin + '",2)',top.moi_ready_delay * 1000)
	}
	else
	{
		force_ready(pin,0)
	}
}

function force_ready(pin,response)
{
	pin = correct(pin.toLowerCase())
	if (!exists(pin)) {return}
	if (typeof(response) == 'undefined')
	{
		response = 0
	}
	if (response == 0)
	{
		set_timeout(pin,0)
		test_response(pin,force_ready,500)
		return
	}
	reset_chime(pin)
	OutputReady(pin,true)
	if (response == 4)
	{
		if (top.moi["codeloc"] == top.moi[pin]["window"])
		{
			setTimeout(top.moi[pin]["window"] + ".location.reload()",500)
		}
		else
		{
			top.location.reload()
		}
		return
	}
	if (response == 2)
	{
		top.moi[pin]["last_loaded"] = "1atom.pdb"
		sendscript(pin,"load 1atom.pdb #req",false)
	}
}

function test_response(pin,functocall,delay)
{
	if (top.moi[pin]["testing"] == 0)
	{
		top.moi[pin]["testing"] = 1
		top.moi[pin]["functocall"] = functocall
		sendscript(pin,"select selected #test",false,1)
		setTimeout("test_response('" + pin + "')",delay)
		return
	}
	if (typeof(top.moi[pin]["functocall"]) == "function")
	{
		top.moi[pin]["functocall"](pin,top.moi[pin]["testing"])
	}
}

function test_load(pin,response)
{
	if (response == 0)
	{
		set_timeout(pin,0)
		test_response(pin,test_load,500)
		return
	}
	top.moi[pin]["testing"] = 0
	if (response == 1)
	{
		if (top.moi[pin]["load_count"] <= 0)
		{
			if (top.moi[pin]["last_loaded"] == "1atom.pdb")
			{
				top.moi["works"] = 0
				exists(pin)
				OutputLoad(pin,2)
				return
			}
			if (top.moi_load_confirm == false)
			{
				givemoretime = false
			}
			else
			{
				text = top.moi_load_confirm
				text = text.replace(/%FILE%/gi,top.moi[pin]["last_loaded"])
				text = text.replace(/%TIME%/gi,top.moi[pin]["loadtime"])
				givemoretime = confirm(text)
			}
			if (!givemoretime)
			{
				response = 2
			}
			else
			{
				top.moi[pin]["load_count"] = top.moi[pin]["loadtime"] * 2 + 1
			}
		}
		if (response != 2)
		{
			OutputLoad(pin,0)
			top.moi[pin]["load_count"]--
			set_timeout(pin,0)
			test_response(pin,test_load,500)
			return
		}
	}
	if (response == 2)
	{
		OutputLoad(pin,2)
		force_ready(pin,4)
		return
	}
	if (response == 3)
	{
		OutputLoad(pin,1)
	}
}

// FUNCTIONS THAT ENABLE SCRIPT AND FUNCTION STAKING

function do_waiting_sptfunc(pin)
{
	sfs_nextf = top.moi[pin]["fstak"][0]

	if (typeof(sfs_nextf) != "function")
		return

	ii = 1
	while (typeof(top.moi[pin]["fstak"][ii]) == "function")
	{
		top.moi[pin]["fstak"][ii - 1] = top.moi[pin]["fstak"][ii]
		ii++
	}
	top.moi[pin]["fstak"][ii - 1] = ""


	if (top.os == 2)
		setTimeout("sfs_nextf(pin)",1100)
	else
		setTimeout("sfs_nextf('" + pin + "')",5)
}

function set_waiting_sptfunc(pin,func)
{
	if (typeof(func) != "function")
	{
		return
	}

	next = 0
	while (typeof(top.moi[pin]["fstak"][next]) == "function")
		next++
	
	top.moi[pin]["fstak"][next] = func
}

function set_waiting_script(pin,spt,showmsg)
{
	set_timeout(pin,1)
	if (top.moi_chimebusy != "") {alert(top.moi_chimebusy)}
	top.moi[pin]["spt_array"][top.moi[pin]["spt_i"]] = new Array(spt,showmsg)
	top.moi[pin]["spt_i"]++
	set_waiting_sptfunc(pin,do_waiting_script)
}

function do_waiting_script(pin)
{
	if (top.moi[pin]["spt_i"] == 0) {return}
	spt = top.moi[pin]["spt_array"][0][0]
	showmsg = top.moi[pin]["spt_array"][0][1]
	xx = 0;ii = top.moi[pin]["spt_i"]
	while (xx < ii - 1)
	{
		top.moi[pin]["spt_array"][xx] = top.moi[pin]["spt_array"][xx + 1]
		xx++
	}
	top.moi[pin]["spt_array"][xx] = null
	top.moi[pin]["spt_i"]--
	sendscript(pin,spt,showmsg)
}

// By Jean-Philippe Demers. Feedback to diane.demers@sympatico.ca


//CHECKJS  D:\bob\promote\profwork\software\organic\js\aroname\divs.js 6/7/02 3:28:17 AM
//browser-dependent div stuff here
//copyright 2001 Robert M. Hanson, St. Olaf College, Northfield, MN.
//initdivs() should be called by body onload=
var DivPosX=new Array()
var DivPosY=new Array()
var DivS=new Array()
var anchorx=0
var anchory=0

function divanchor(s){
	var e=s
	var doc=document
	D=new Array()
	
	if(isnn4){
		if(doc[s]==null)return D
		D.left=doc[e].x
		D.top=doc[e].y
	}else{
		e=(isnn6?doc.getElementById(s):doc.all[s])
		if(e==null && isnn6)e=doc[s]
		if(e==null && isnn6)e=doc.anchors[s]
		if(e==null && isnn6)e=doc.images[s]	
		if(e==null)return D
		D.left=e.offsetLeft
		D.top=e.offsetTop
		while(e.offsetParent!=null){
			e=e.offsetParent
			D.left+=e.offsetLeft
			D.top+=e.offsetTop
		}
	}
	anchorx=D.left
	anchory=D.top
	return D
}

function divmove(s,x,y){
	var d=findlayer(s)
	if(d==null)return null
	x+=anchorx
	y+=anchory
	if(isnn4){
		d.left=x
		d.top=y
	}else{
		d.style.left=x
		d.style.top=y
	}
	DivPosX[s]=x
	DivPosY[s]=y
	return d
}

function divwidth(s){
	var d=findlayer(s)
	return(isnn4?d.clip.width:isnn6?d.offsetWidth:d.clientWidth)
}

function findlayer(name){
	if(isnn4)return document.layers[name]
	if(isnn6)return document.getElementById(name)
	if(isie4)return eval('document.all.' + name)
	return false
}

function getdivlistbox(sdiv,slistbox){
	if(isnn4){
		//no var here!
		ds=findlayer(sdiv)
		return eval("ds.document."+slistbox)
	}
	return eval("document."+slistbox)
}

function initdivs(){
	isnn4=(document.layers?true:false)
	isie4=(document.all?true:false)
	isnn6=(!isie4 && document.getElementById?true:false)
	if(!isnn4 && !isie4 && !isnn6)alert("This page will work properly only with browsers capable of supporting layers.")
}

function movedivleft(name,left){
	var ds=findlayer(name)
	var d=(isnn4?ds:ds.style)
	d.left=left
}

function writediv(name,sinfo){
	var ds=findlayer(name)
	
	if(isnn4){
		ds.document.open()
		ds.document.write(sinfo)
		ds.document.close()
	}else{
		ds.innerHTML=sinfo
	}
	DivS[name]=sinfo
}

function writedivtextarea(name,stextarea,sinfo){
	if(isnn4){
		var ds=findlayer(name)
		var d=eval("ds.document."+stextarea)
	}else{
		var d=eval("document."+stextarea)
	}
	d.value=sinfo
}

