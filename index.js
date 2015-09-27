
import 'whatwg-fetch'

const FILENAME = './grey.jpg'

var res = null
var buf = null
var blob = null

var image = new Image()
document.body.appendChild( image )

var canvas = document.querySelector( 'canvas' )
var ctx = canvas.getContext( '2d' )

function fromBlob( blob ) {
    image.src = URL.createObjectURL( blob )
}

function fromArray( arr ) {
    image.src = URL.createObjectURL( new Blob( [arr], {
        type: 'image/jpeg'
    }))
}

function blobToCanvas( blob ) {
    let img = new Image()
    img.onload = () => {
        ctx.drawImage( img, 0, 0 )
    }
    img.src = URL.createObjectURL( blob )
}


function blobToImageData( blob ) {
    console.log( 'returns a promise dude' )
    console.log( 'also tacks imageData to window.imageData' )
    return new Promise( ( resolve, reject ) => {
        let img = new Image()
        let canvas = document.createElement( 'canvas' )
        let ctx = canvas.getContext( '2d' )

        img.onload = () => {
            ctx.drawImage( img, 0, 0 )
            window.imageData = ctx.getImageData( 0, 0, 32, 32 )
            resolve( window.imageData )
        }
        img.src = URL.createObjectURL( blob )
    })
}

function setRed( blob, value ) {
    console.log( 'Dropping red channel from image' )
    blobToImageData( blob )
        .then( imageData => {
            for( var i = 0; i < imageData.data.length; i = i + 4 ) {
                imageData.data[ i ] = value || 0
            }

            ctx.putImageData( imageData, 0, 0 )
        })
}


fetch( FILENAME )
    .then( r => r.blob() )
    .then( b => {
        blob = b
        window.blob = b
    })

fetch( FILENAME )
    .then( r => r.arrayBuffer() )
    .then( ab => {
        buf = ab
        window.buf = ab
    })

window.res = res
// window.buf = buf
// window.blob = blob
window.image = image
window.fromBlob = fromBlob
window.fromArray = fromArray
window.blobToCanvas = blobToCanvas
window.blobToImageData = blobToImageData
window.setRed = setRed

window.canvas = canvas
window.ctx = ctx
