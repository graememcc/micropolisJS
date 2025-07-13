/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * The name/term "MICROPOLIS" is a registered trademark of Micropolis (https://www.micropolis.com) GmbH
 * (Micropolis Corporation, the "licensor") and is licensed here to the authors/publishers of the "Micropolis"
 * city simulation game and its source code (the project or "licensee(s)") as a courtesy of the owner.
 *
 */

// TODO Add comment for each tile

export const DIRT           = 0; // Clear tile
// tile 1 ?

/* Water */
export const RIVER          = 2;
export const REDGE          = 3;
export const CHANNEL        = 4;
export const FIRSTRIVEDGE   = 5;
// tile 6 -- 19 ?
export const LASTRIVEDGE    = 20;
export const WATER_LOW      = RIVER;   // First water tile
export const WATER_HIGH     = LASTRIVEDGE; // Last water tile (inclusive)

export const TREEBASE       = 21;
export const WOODS_LOW      = TREEBASE;
export const LASTTREE       = 36;
export const WOODS          = 37;
export const UNUSED_TRASH1  = 38;
export const UNUSED_TRASH2  = 39;
export const WOODS_HIGH     = UNUSED_TRASH2; // Why is an 'UNUSED' tile used?
export const WOODS2         = 40;
export const WOODS3         = 41;
export const WOODS4         = 42;
export const WOODS5         = 43;

/* Rubble (4 tiles) */
export const RUBBLE         = 44;
export const LASTRUBBLE     = 47;

export const FLOOD          = 48;
// tile 49, 50 ?
export const LASTFLOOD      = 51;

export const RADTILE        = 52; // Radio-active contaminated tile

export const UNUSED_TRASH3  = 53;
export const UNUSED_TRASH4  = 54;
export const UNUSED_TRASH5  = 55;

/* Fire animation (8 tiles) */
export const FIRE           = 56;
export const FIREBASE       = FIRE;
export const LASTFIRE       = 63;

export const HBRIDGE        = 64; // Horizontal bridge
export const ROADBASE       = HBRIDGE;
export const VBRIDGE        = 65; // Vertical bridge
export const ROADS          = 66;
export const ROADS2         = 67;
export const ROADS3         = 68;
export const ROADS4         = 69;
export const ROADS5         = 70;
export const ROADS6         = 71;
export const ROADS7         = 72;
export const ROADS8         = 73;
export const ROADS9         = 74;
export const ROADS10        = 75;
export const INTERSECTION   = 76;
export const HROADPOWER     = 77;
export const VROADPOWER     = 78;
export const BRWH           = 79;
export const LTRFBASE       = 80; // First tile with low traffic
// tile 81 -- 94 ?
export const BRWV           = 95;
// tile 96 -- 110 ?
export const BRWXXX1        = 111;
// tile 96 -- 110 ?
export const BRWXXX2        = 127;
// tile 96 -- 110 ?
export const BRWXXX3        = 143;
export const HTRFBASE       = 144; // First tile with high traffic
// tile 145 -- 158 ?
export const BRWXXX4        = 159;
// tile 160 -- 174 ?
export const BRWXXX5        = 175;
// tile 176 -- 190 ?
export const BRWXXX6        = 191;
// tile 192 -- 205 ?
export const LASTROAD       = 206;
export const BRWXXX7        = 207;

/* Power lines */
export const HPOWER         = 208;
export const VPOWER         = 209;
export const LHPOWER        = 210;
export const LVPOWER        = 211;
export const LVPOWER2       = 212;
export const LVPOWER3       = 213;
export const LVPOWER4       = 214;
export const LVPOWER5       = 215;
export const LVPOWER6       = 216;
export const LVPOWER7       = 217;
export const LVPOWER8       = 218;
export const LVPOWER9       = 219;
export const LVPOWER10      = 220;
export const RAILHPOWERV    = 221; // Horizontal rail, vertical power
export const RAILVPOWERH    = 222; // Vertical rail, horizontal power
export const POWERBASE      = HPOWER;
export const LASTPOWER      = RAILVPOWERH;

export const UNUSED_TRASH6  = 223;

/* Rail */
export const HRAIL          = 224;
export const VRAIL          = 225;
export const LHRAIL         = 226;
export const LVRAIL         = 227;
export const LVRAIL2        = 228;
export const LVRAIL3        = 229;
export const LVRAIL4        = 230;
export const LVRAIL5        = 231;
export const LVRAIL6        = 232;
export const LVRAIL7        = 233;
export const LVRAIL8        = 234;
export const LVRAIL9        = 235;
export const LVRAIL10       = 236;
export const HRAILROAD      = 237;
export const VRAILROAD      = 238;
export const RAILBASE       = HRAIL;
export const LASTRAIL       = 238;

export const ROADVPOWERH    = 239; /* bogus? */

// Residential zone tiles

export const RESBASE        = 240; // Empty residential, tiles 240--248
export const FREEZ          = 244; // center-tile of 3x3 empty residential

export const HOUSE          = 249; // Single tile houses until 260
export const LHTHR          = HOUSE;
export const HHTHR          = 260;

export const RZB            = 265; // center tile first 3x3 tile residential

export const HOSPITALBASE   = 405; // Center of hospital (tiles 405--413)
export const HOSPITAL       = 409; // Center of hospital (tiles 405--413)

export const CHURCHBASE     = 414; // Center of church (tiles 414--422)
export const CHURCH0BASE    = 414; // numbered alias
export const CHURCH         = 418; // Center of church (tiles 414--422)
export const CHURCH0        = 418; // numbered alias

// Commercial zone tiles

export const COMBASE        = 423; // Empty commercial, tiles 423--431
// tile 424 -- 426 ?
export const COMCLR         = 427;
// tile 428 -- 435 ?
export const CZB            = 436;
// tile 437 -- 608 ?
export const COMLAST        = 609;
// tile 610, 611 ?

// Industrial zone tiles.
export const INDBASE        = 612; // Top-left tile of empty industrial zone.
export const INDCLR         = 616; // Center tile of empty industrial zone.
export const LASTIND        = 620; // Last tile of empty industrial zone.

// Industrial zone population 0, value 0: 621 -- 629
export const IND1           = 621; // Top-left tile of first non-empty industry zone.
export const IZB            = 625; // Center tile of first non-empty industry zone.

// Industrial zone population 1, value 0: 630 -- 638

// Industrial zone population 2, value 0: 639 -- 647
export const IND2           = 641;
export const IND3           = 644;

// Industrial zone population 3, value 0: 648 -- 656
export const IND4           = 649;
export const IND5           = 650;

// Industrial zone population 0, value 1: 657 -- 665

// Industrial zone population 1, value 1: 666 -- 674

// Industrial zone population 2, value 1: 675 -- 683
export const IND6           = 676;
export const IND7           = 677;

// Industrial zone population 3, value 1: 684 -- 692
export const IND8           = 686;
export const IND9           = 689;

// Seaport
export const PORTBASE       = 693; // Top-left tile of the seaport.
export const PORT           = 698; // Center tile of the seaport.
export const LASTPORT       = 708; // Last tile of the seaport.

export const AIRPORTBASE    = 709;
// tile 710 ?
export const RADAR          = 711;
// tile 712 -- 715 ?
export const AIRPORT        = 716;
// tile 717 -- 744 ?

// Coal power plant (4x4).
export const COALBASE       = 745; // First tile of coal power plant.
export const POWERPLANT     = 750; // 'Center' tile of coal power plant.
export const LASTPOWERPLANT = 760; // Last tile of coal power plant.

// Fire station (3x3).
export const FIRESTBASE     = 761; // First tile of fire station.
export const FIRESTATION    = 765; // 'Center tile' of fire station.
// 769 last tile fire station.

export const POLICESTBASE   = 770;
// tile 771 -- 773 ?
export const POLICESTATION  = 774;
// tile 775 -- 778 ?

// Stadium (4x4).
export const STADIUMBASE    = 779; // First tile stadium.
export const STADIUM        = 784; // 'Center tile' stadium.
// Last tile stadium 794.

// tile 785 -- 799 ?
export const FULLSTADIUM    = 800;
// tile 801 -- 810 ?

// Nuclear power plant (4x4).
export const NUCLEARBASE    = 811; // First tile nuclear power plant.
export const NUCLEAR        = 816; // 'Center' tile nuclear power plant.
export const LASTZONE       = 826; // Also last tile nuclear power plant.

export const LIGHTNINGBOLT  = 827;
export const HBRDG0         = 828;
export const HBRDG1         = 829;
export const HBRDG2         = 830;
export const HBRDG3         = 831;
export const HBRDG_END      = 832;
export const RADAR0         = 832;
export const RADAR1         = 833;
export const RADAR2         = 834;
export const RADAR3         = 835;
export const RADAR4         = 836;
export const RADAR5         = 837;
export const RADAR6         = 838;
export const RADAR7         = 839;
export const FOUNTAIN       = 840;
// tile 841 -- 843: fountain animation.
export const INDBASE2       = 844;
export const TELEBASE       = 844;
// tile 845 -- 850 ?
export const TELELAST       = 851;
export const SMOKEBASE      = 852;
// tile 853 -- 859 ?
export const TINYEXP        = 860;
// tile 861 -- 863 ?
export const SOMETINYEXP    = 864;
// tile 865 -- 866 ?
export const LASTTINYEXP    = 867;
// tile 868 -- 882 ?
export const TINYEXPLAST    = 883;
// tile 884 -- 915 ?

export const COALSMOKE1     = 916; // Chimney animation at coal power plant (2, 0).
// 919 last animation tile for chimney at coal power plant (2, 0).

export const COALSMOKE2     = 920; // Chimney animation at coal power plant (3, 0).
// 923 last animation tile for chimney at coal power plant (3, 0).

export const COALSMOKE3     = 924; // Chimney animation at coal power plant (2, 1).
// 927 last animation tile for chimney at coal power plant (2, 1).

export const COALSMOKE4     = 928; // Chimney animation at coal power plant (3, 1).
// 931 last animation tile for chimney at coal power plant (3, 1).

export const FOOTBALLGAME1  = 932;
// tile 933 -- 939 ?
export const FOOTBALLGAME2  = 940;
// tile 941 -- 947 ?
export const VBRDG0         = 948;
export const VBRDG1         = 949;
export const VBRDG2         = 950;
export const VBRDG3         = 951;

export const NUKESWIRL1     = 952;
export const NUKESWIRL2     = 953;
export const NUKESWIRL3     = 954;
export const NUKESWIRL4     = 955;

// export const  956-959 unused (originally)
// original tile count = 960;

// Extended zones: 956-1019
export const CHURCH1BASE    = 956;
export const CHURCH1        = 960;
export const CHURCH2BASE    = 965;
export const CHURCH2        = 969;
export const CHURCH3BASE    = 974;
export const CHURCH3        = 978;
export const CHURCH4BASE    = 983;
export const CHURCH4        = 987;
export const CHURCH5BASE    = 992;
export const CHURCH5        = 996;
export const CHURCH6BASE    = 1001;
export const CHURCH6        = 1005;
export const CHURCH7BASE    = 1010;
export const CHURCH7        = 1014;
export const CHURCH7LAST    = 1018;

// tiles 1020-1023 unused

export const TILE_COUNT     = 1024;

export const TILE_INVALID   = -1; // Invalid tile (not used in the world map).
