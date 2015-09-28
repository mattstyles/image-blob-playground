
import 'whatwg-fetch'

const FILENAME = './half.jpg'

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

function createView( data ) {
    var buf = new ArrayBuffer( data.length )
    var buf8 = new Uint8ClampedArray( buf )
    var view = new Uint32Array( buf )

    buf8.set( data.slice( 0 ) )

    return [ buf, buf8, view ]
}

function putValue( view, pos, value ) {
    console.log( 'use Uint32Array' )

    view[ pos ] = ( 255 << 24 ) |
        ( value << 16 ) |
        ( value << 8 ) |
        ( value )

    return view
}

// Only returns red channel
function getValue( value ) {
    return ( value >> 16 ) & 0xff
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

function renderToCanvas( buf8 ) {
    imageData.data.set( buf8 )
    ctx.putImageData( imageData, 0, 0 )
}

// This is fairly dirty and can be improved, it was done hastily
// Looks like theres some info in http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function replaceColour( value ) {
    var start = performance.now()
    blobToImageData( blob )
        .then( imageData => {
            var bufs = createView( imageData.data )
            var view = bufs[ 2 ]
            for( let i = 0; i < view.length; i++ ) {
                if ( getValue( view[ i ] ) === 128 ) {
                    putValue( view, i, value || 0x88 )
                }
            }

            imageData.data.set( bufs[ 1 ] )
            ctx.putImageData( imageData, 0, 0 )
            console.log( 'done in', performance.now() - start, 'ms' )
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
window.createView = createView
window.putValue = putValue
window.renderToCanvas = renderToCanvas
window.getValue = getValue
window.replaceColour = replaceColour

window.canvas = canvas
window.ctx = ctx
