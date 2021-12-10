const {
    WAConnection:_WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const fs = require('fs')
const simple = require('./lib/simple.js')
const WAConnection = simple.WAConnection(_WAConnection)
const { banner, start, success } = require('./lib/myfunctions')
const { color } = require('./lib/color')

require('./index.js')
nocache('./index.js', module => console.log(`${module} now updated!`))

const starts = async (conn = new WAConnection()) => {
    conn.logger.level = 'warn'
    console.log(banner.string)
    conn.on('qr', () => {
        console.log(color('[','white'), color('!','red'), color(']','white'), color(' SCAN QR TO CONNECT'))
    })

    fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')
    conn.on('connecting', () => {
        start('2', 'Connecting bot...')
    })
    conn.on('open', () => {
        success('2', 'Connected...')
    })
    await conn.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))

    conn.on('chat-update', async (message) => {
        require('./index.js')(conn, message)
    })
    
    conn.on('group-participants-update', async (anu) => {
		//if (!welkom.includes(anu.jid)) return
		try {
			const mdata = await conn.groupMetadata(anu.jid)
			console.log(anu)
			if (anu.action == 'add') {
				num = anu.participants[0]
				try {
					ppimg = await conn.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Halo @${num.split('@')[0]}\nSelamat datang di group *${mdata.subject}*`
				let buff = await getBuffer(ppimg)
				conn.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			} else if (anu.action == 'remove') {
				num = anu.participants[0]
				try {
					ppimg = await conn.getProfilePicture(`${num.split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Sayonara @${num.split('@')[0]}👋`
				let buff = await getBuffer(ppimg)
				conn.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})

    conn.on('group-update', async (anu) => {
		const metdata = await conn.groupMetadata(anu.jid)
    	const fkontakk = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(anu.jid ? { remoteJid: '6283136505591-1604595598@g.us' } : {})}, message: { "contactMessage":{"displayName": `${metdata.subject}`,"vcard":`BEGIN:VCARD\nVERSION:3.0\nN:2;Adii;;;\nFN:Adii\nitem1.TEL;waid=60199782326:60199782326\nitem1.X-ABLabel:Mobile\nEND:VCARD` }}}
    if(anu.announce == 'false'){
    teks = `- [ Group Opened ] -\n\n_Group telah dibuka oleh admin_\n_Sekarang semua member bisa mengirim pesan_`
    conn.sendMessage(metdata.id, teks, MessageType.text, {quoted: fkontakk})
    console.log(color('[GROUP]'), color(`Group Opened In ${metdata.subject}`, 'cyan'))
  }
  else if(anu.announce == 'true'){
    teks = `- [ Group Closed ] -\n\n_Group telah ditutup oleh admin_\n_Sekarang hanya admin yang dapat mengirim pesan_`
    conn.sendMessage(metdata.id, teks, MessageType.text, {quoted: fkontakk})
    console.log(color('[GROUP]'), color(`Group Closed In ${metdata.subject}`,  'cyan'))
  }
  /*else if(!anu.desc == ''){
    tag = anu.descOwner.split('@')[0] + '@s.whatsapp.net'
    teks = `- [ Group Description Change ] -\n\nDeskripsi Group telah diubah oleh Admin @${anu.descOwner.split('@')[0]}\n• Deskripsi Baru : ${anu.desc}`
    conn.sendMessage(metdata.id, teks, MessageType.text, {contextInfo: {"mentionedJid": [tag]}, quoted: fkontakk})
    console.log(color('[GROUP]'), color(`Group Description Change In ${metdata.subject}`, 'cyan'))
  }*/
  else if(anu.restrict == 'false'){
    teks = `- [ Group Setting Change ] -\n\nEdit Group info telah dibuka untuk member\nSekarang semua member dapat mengedit info Group Ini`
    conn.sendMessage(metdata.id, teks, MessageType.text, {quoted: fkontakk})
    console.log(color('[GROUP]'), color(`Group Setting Change In ${metdata.subject}`, 'cyan'))
  }
  else if(anu.restrict == 'true'){
    teks = `- [ Group Setting Change ] -\n\nEdit Group info telah ditutup untuk member\nSekarang hanya admin group yang dapat mengedit info Group Ini`
    conn.sendMessage(metdata.id, teks, MessageType.text, {quoted: fkontakk})
    console.log(color('[GROUP]'), color(`Group Setting Change In ${metdata.subject}`,  'cyan'))
  }
  })
}

/************************************
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, cb = () => { }) {
    console.log('Module', `'${module}'`, 'is now ready to run!')
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

/*************************************
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

starts()
