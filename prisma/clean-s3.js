const AWS = require('aws-sdk')

// configure suas credenciais corretamente aqui
const s3 = new AWS.S3({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const BUCKET = 'elias-docs'

async function deleteAllS3Objects() {
  const list = await s3
    .listObjectsV2({ Bucket: BUCKET, Prefix: 'documentos/' })
    .promise()

  if (list.Contents.length === 0) return console.log('Nada para apagar.')

  const objectsToDelete = list.Contents.map((item) => ({ Key: item.Key }))

  await s3
    .deleteObjects({
      Bucket: BUCKET,
      Delete: { Objects: objectsToDelete },
    })
    .promise()

  console.log(`🧼 ${objectsToDelete.length} arquivos apagados do S3`)
}

deleteAllS3Objects().catch(console.error)
