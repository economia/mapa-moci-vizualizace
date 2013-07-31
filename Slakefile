require! child_process.exec
require! iconv.Iconv

directory = 'statnifirmy'
option 'buildFile' 'File to be transpiled and converted to Win-1250' 'FILE'
iconv = new Iconv 'UTF-8', 'CP1250'
task \build1250 ({buildFile}) ->
    (err, out) <~ exec "lsc -o ./www/js/#directory/ -c #buildFile"
    [...dirs, filename] = buildFile.split '\\'
    [filename, ext] = filename.split "."
    jsAddress = "./www/js/#directory/#filename.js"
    contentUtf = fs.readFileSync jsAddress
    contentWin = iconv.convert contentUtf
    fs.writeFileSync jsAddress, contentWin
    throw err if err
    console.log out
