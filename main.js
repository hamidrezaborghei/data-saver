import { exists } from 'fs';
import * as Minio from 'minio'
import { backUp, getBackUp, makeBackUp } from './utils'


const client = new Minio.Client({
    endPoint : 'localhost',
    port : 9000,
    useSSL : false,
    accessKey : "minioadmin",
    secretKey : 'minioadmin'
})

const userId = "hamidreza";
const gameId = "pes";
const gameFolder = "testdir"
const gameDir = __dirname
const type = "get"

console.log("Checking Bucket ...")
client.bucketExists(userId,(err,exists) => {
    if(err)
        console.log(err)
    if(!exists)
    {
        console.log("Creating Bucket ...")
        client.makeBucket(userId,'us-east-1',(err) => {
            if(err){
                console.log(err)
            }
            else
            {
                backUp(type,client,userId,gameDir,gameFolder,gameId)
            }
        })
    }
    else
    {
        backUp(type,client,userId,gameDir,gameFolder,gameId)
    }
})

