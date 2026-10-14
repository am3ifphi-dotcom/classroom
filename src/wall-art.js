// Draw dimensions shared by the renderer and layout regression tests.
// The sill extends two pixels below the window image itself.
export const WALL_ART={
 window:{width:98,height:70,offsetY:-67,bottomTrim:2},
 board:{width:258,height:102,offsetY:-90,bottomTrim:0}
};
export function wallArtBounds(prop){
 const art=WALL_ART[prop.type];
 if(!art)return null;
 return {x:prop.x,y:prop.y+art.offsetY,w:art.width,h:art.height+art.bottomTrim};
}
