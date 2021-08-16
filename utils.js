import Minio from 'minio'
import Fs from 'fs'
import Fse from 'fs-extra'
import Archiver from 'archiver'
import Unzipper from 'unzipper'

export const upload = (client,bucketName,dir,folderName,fileName) => {
    let fileStream = Fs.createReadStream(dir +  fileName)
    let fileStat = Fs.stat(dir + fileName,(err,stat) => {
        if(err){
            console.log(err)
        }
         client.putObject(bucketName,fileName,fileStream,stat.size,(err,objInfo) => {
            if(err)
            {
                console.log(err)
            }
            else
            {
                console.log("Removing junk files...")
                Fs.rmdir(dir + folderName,{ recursive: true },(err) => {
                    if(err)
                    {
                        console.log(err)
                    }
                    Fs.unlinkSync(dir + fileName);
                })
                
            }
        })
    })
}

export const download = (client,bucketName,dir,fileName) => {
    
    let writeStream = Fs.createWriteStream(dir + fileName);
    client.getObject(bucketName,fileName,(err,stream) => {
        if(err)
        {
            console.log(err)
        }
        else{
            console.log("Writing backup...")

            stream.on("data",(chunk) => {
                writeStream.write(chunk);
            })
            stream.on("end",(chunk) => {
                writeStream.end();
            })
            console.log("Extracting backup...")
            Fs.createReadStream(dir + fileName).pipe(Unzipper.Extract({path : dir}))
            console.log("Removing junk files...")
            Fs.unlinkSync(dir + fileName);

        }
        
    })
    

}

export const makeBackUp = (client,bucketName,path,folderName,fileName) => {
    console.log("Making backup from user game setting...")
    Fse.copy(path + "/" + folderName + "/",__dirname + "/backups/"+folderName)
    const arch = Archiver('zip');
    const output = Fs.createWriteStream(__dirname + "/backups/"+ fileName + ".zip")
    arch.pipe(output)
    arch.directory(__dirname + "/" + folderName + "/",folderName)
    arch.finalize()
    output.on('finish', function() {
    // console.log("done")
    console.log("Uploading backup...")
        upload(client,bucketName,__dirname + "/backups/",folderName,fileName + ".zip")
    });

}

export const getBackUp = (client,bucketName,path,folderName,fileName) => {
    console.log("Removing game old settings...")
    Fs.rmdir(path + "/" + folderName,{recursive : true} , (err) => {
    if(err){
    console.log(err)
    }
    else{
    console.log("Downloading backup...")
    download(client,bucketName,path + "/",fileName + ".zip");
}
})
}


export const backUp = (type,client,bucketName,path,folderName,fileName) => {
    switch(type){
        case "make":
            makeBackUp(client,bucketName,path,folderName,fileName)
            return;
        case "get":
            getBackUp(client,bucketName,path,folderName,fileName)
            return;
    }
} 