// Import the necessary modules and classes
const runEntrypoint = require('@companion-module/base').runEntrypoint
const Paradigm = require('../paradigm')
const { InstanceStatus } = require('@companion-module/base')

// Create a mock Paradigm class
jest.mock('../paradigm')

// Mock Companion to get the class
jest.mock('@companion-module/base', () => {
	const original = jest.requireActual('@companion-module/base')
	return {
		...original,
		InstanceBase: jest.fn(),
		runEntrypoint: jest.fn(),
	}
})

// Define the test suite for ModuleInstance
describe.only('ModuleInstance', () => {
	let instance

	const ModuleInstance = require('../main')
	const module = runEntrypoint.mock.calls[0][0]

	const controlStatus = {
		presets: {
			40: 'Deactivated',
			41: 'Deactivated',
			2: 'Deactivated',
			3: 'Deactivated',
			4: 'Activated',
			5: 'Deactivated',
			6: 'Deactivated',
			7: 'Deactivated',
			8: 'Deactivated',
			9: 'Deactivated',
			10: 'Deactivated',
			11: 'Deactivated',
			12: 'Deactivated',
			13: 'Deactivated',
			14: 'Deactivated',
			15: 'Deactivated',
			16: 'Altered',
			17: 'Deactivated',
			18: 'Deactivated',
			19: 'Deactivated',
			20: 'Altered',
			21: 'Deactivated',
			22: 'Altered',
			23: 'Deactivated',
			24: 'Deactivated',
			25: 'Deactivated',
			26: 'Deactivated',
			27: 'Deactivated',
			28: 'Deactivated',
			29: 'Deactivated',
			30: 'Deactivated',
			31: 'Deactivated',
			32: 'Deactivated',
			33: 'Deactivated',
			34: 'Deactivated',
			35: 'Deactivated',
			36: 'Deactivated',
			37: 'Deactivated',
			39: 'Deactivated',
			42: 'Deactivated',
			43: 'Deactivated',
		},
		sequences: {},
		walls: {},
		channels: {
			0: 100,
			1: 100,
			2: 100,
			3: 100,
			4: 100,
			5: 100,
			6: 100,
			7: 100,
			8: 100,
			9: 100,
			10: 100,
			11: 100,
			12: 100,
			13: 100,
			14: 100,
			15: 100,
			16: 100,
			17: 100,
			18: 100,
			19: 100,
			20: 100,
			21: 100,
			22: 100,
			23: 100,
			24: 100,
			25: 100,
			26: 100,
			27: 100,
			28: 100,
			29: 100,
			30: 100,
			31: 100,
			32: 100,
			33: 100,
			34: 100,
			35: 100,
			36: 100,
			37: 100,
			38: 100,
			39: 100,
			40: 100,
			41: 100,
			42: 100,
			43: 100,
			44: 100,
			45: 100,
			46: 100,
			47: 100,
			48: 100,
			49: 100,
			50: 100,
			51: 100,
			52: 100,
			53: 100,
			54: 100,
			55: 100,
			56: 100,
			57: 100,
			58: 100,
			59: 100,
			60: 100,
			61: 100,
			62: 100,
			63: 100,
			64: 100,
			65: 100,
			66: 100,
			67: 100,
			68: 100,
			69: 100,
			70: 100,
			71: 100,
			72: 100,
			73: 100,
			74: 100,
			75: 100,
			76: 100,
			77: 100,
			78: 100,
			79: 100,
			80: 100,
			81: 100,
			82: 100,
			83: 100,
			84: 100,
			85: 100,
			86: 100,
			87: 100,
			88: 100,
			89: 100,
			90: 100,
			91: 100,
			92: 100,
			93: 100,
			94: 100,
			95: 100,
			96: 100,
			97: 100,
			98: 100,
			99: 100,
			100: 100,
			101: 100,
			102: 100,
			103: 100,
			104: 100,
			105: 100,
			106: 100,
			107: 100,
			108: 100,
			109: 100,
			110: 100,
			111: 100,
			112: 100,
			113: 100,
			114: 100,
			115: 100,
			116: 100,
			117: 100,
			118: 100,
			119: 100,
			120: 100,
			121: 100,
			122: 100,
			123: 100,
			124: 100,
			125: 100,
			126: 100,
			127: 100,
			128: 100,
			129: 100,
			130: 100,
			131: 100,
			132: 100,
			133: 100,
			134: 100,
			135: 100,
			136: 100,
			137: 100,
			138: 100,
			139: 100,
			140: 100,
			141: 100,
			142: 100,
			143: 100,
			144: 100,
			145: 100,
			146: 100,
			147: 100,
			148: 100,
			149: 100,
			150: 100,
			151: 100,
			152: 100,
			153: 100,
			154: 100,
			155: 100,
			156: 100,
			157: 100,
			158: 100,
			159: 100,
			160: 100,
			161: 100,
			162: 100,
			163: 100,
			164: 100,
			165: 100,
			166: 100,
			167: 100,
			168: 100,
			169: 100,
			170: 100,
			171: 100,
			172: 100,
			173: 100,
			174: 0,
			175: 0,
			176: 0,
			177: 0,
			178: 0,
			179: 0,
			180: 0,
			181: 0,
			182: 0,
			183: 0,
			184: 0,
			185: 0,
			186: 0,
			187: 0,
			188: 0,
			189: 0,
			190: 0,
			191: 0,
			192: 0,
			193: 0,
			194: 0,
			195: 0,
			196: 0,
			197: 0,
			198: 0,
			199: 0,
			200: 0,
			201: 0,
			202: 0,
			203: 0,
			204: 100,
			205: 0,
			206: 100,
			207: 0,
			208: 0,
			209: 0,
			210: 0,
			211: 0,
			212: 0,
			213: 0,
			214: 0,
			215: 0,
			216: 0,
			217: 0,
			218: 0,
			219: 0,
			220: 0,
			221: 0,
			222: 0,
			223: 0,
			224: 0,
			225: 0,
			226: 0,
			227: 0,
			228: 0,
			229: 0,
			230: 0,
			231: 0,
			232: 0,
			233: 0,
			234: 0,
			235: 0,
			236: 0,
			237: 0,
			238: 0,
			239: 0,
			240: 0,
			241: 0,
			242: 0,
			243: 0,
			244: 0,
			245: 0,
			246: 0,
			247: 0,
			248: 0,
			249: 0,
			250: 0,
			251: 0,
			252: 0,
			253: 0,
			254: 0,
			255: 0,
			256: 0,
			257: 0,
			258: 0,
			259: 0,
			260: 0,
			261: 0,
			262: 0,
			263: 0,
			264: 0,
			265: 0,
			266: 0,
			267: 0,
			268: 0,
			269: 0,
			270: 0,
			271: 0,
			272: 0,
			273: 0,
			274: 0,
			275: 0,
			276: 0,
			277: 0,
			278: 0,
			279: 0,
			280: 0,
			281: 0,
			282: 0,
			283: 0,
			284: 0,
			285: 0,
			286: 0,
			287: 0,
			288: 0,
			289: 0,
			290: 0,
			291: 0,
			292: 0,
			293: 0,
			294: 0,
			295: 0,
			296: 0,
			297: 0,
			298: 0,
			299: 0,
			300: 100,
			301: 100,
			302: 100,
			303: 100,
			304: 100,
			305: 100,
			306: 100,
			307: 100,
			308: 100,
			309: 100,
			310: 100,
			311: 100,
			312: 100,
			313: 100,
			314: 100,
			315: 100,
			316: 100,
			317: 100,
			318: 100,
			319: 100,
			320: 100,
			321: 100,
			322: 100,
			323: 100,
			324: 0,
			325: 0,
			326: 0,
			327: 0,
			328: 0,
			329: 0,
			330: 0,
			331: 0,
			332: 0,
			333: 0,
			334: 0,
			335: 0,
			336: 0,
			337: 0,
			338: 0,
			339: 0,
			340: 0,
			341: 0,
			342: 0,
			343: 0,
			344: 0,
			345: 0,
			346: 0,
			347: 0,
			348: 0,
			349: 0,
			350: 0,
			351: 0,
			352: 0,
			353: 0,
			354: 0,
			355: 0,
			356: 0,
			357: 0,
			358: 0,
			359: 0,
			360: 0,
			361: 0,
			362: 0,
			363: 0,
			364: 0,
			365: 0,
			366: 0,
			367: 0,
			368: 0,
			369: 0,
			370: 0,
			371: 0,
			372: 0,
			373: 0,
			374: 0,
			375: 0,
			376: 0,
			377: 0,
			378: 0,
			379: 0,
			380: 0,
			381: 0,
			382: 0,
			383: 0,
			384: 0,
			385: 0,
			386: 0,
			387: 0,
			388: 0,
			389: 0,
			390: 0,
			391: 0,
			392: 0,
			393: 0,
			394: 0,
			395: 0,
			396: 0,
			397: 0,
			398: 0,
			399: 0,
			400: 0,
			401: 0,
			402: 0,
			403: 0,
			404: 0,
			405: 0,
			406: 0,
			407: 0,
			408: 0,
			409: 0,
			410: 0,
			411: 0,
			412: 0,
			413: 0,
			414: 0,
			415: 0,
			416: 0,
			417: 0,
			418: 0,
			419: 0,
			420: 0,
			421: 0,
			422: 0,
			423: 0,
			424: 0,
			425: 0,
			426: 0,
			427: 0,
			428: 0,
			429: 0,
			430: 0,
			431: 0,
			432: 0,
			433: 0,
			434: 0,
			435: 0,
			436: 0,
			437: 0,
			438: 0,
			439: 0,
			440: 0,
			441: 0,
			442: 0,
			443: 0,
			444: 0,
			445: 0,
			446: 0,
			447: 0,
			448: 0,
			449: 0,
			450: 0,
			451: 0,
			452: 0,
			453: 0,
			454: 0,
			455: 0,
			456: 0,
			457: 0,
			458: 0,
			459: 0,
			460: 0,
			461: 0,
			462: 0,
			463: 0,
			464: 0,
			465: 0,
			466: 0,
			467: 0,
			468: 0,
			469: 0,
			470: 0,
			471: 0,
			472: 0,
			473: 0,
			474: 0,
			475: 0,
			476: 0,
			477: 0,
			478: 0,
			479: 0,
			480: 0,
			481: 0,
			482: 0,
			483: 0,
			484: 0,
			485: 0,
			486: 0,
			487: 0,
			488: 0,
			489: 0,
			490: 0,
			491: 0,
			492: 0,
			493: 0,
			494: 0,
			495: 0,
			496: 0,
			497: 0,
			498: 0,
			499: 0,
			500: 0,
			501: 0,
			502: 0,
			503: 0,
			504: 0,
			505: 0,
			506: 0,
			507: 0,
			508: 0,
			509: 0,
			510: 0,
			511: 0,
			512: 0,
			513: 0,
			514: 0,
			515: 0,
			516: 0,
			517: 0,
			518: 0,
			519: 0,
			520: 0,
			521: 0,
			522: 0,
			523: 0,
			524: 0,
			525: 0,
			526: 0,
			527: 0,
			528: 0,
			529: 0,
			530: 0,
			531: 0,
			532: 0,
			533: 0,
			534: 0,
			535: 0,
			536: 0,
			537: 0,
			538: 0,
			539: 0,
			540: 0,
			541: 0,
			542: 0,
			543: 0,
			544: 0,
			545: 0,
			546: 0,
			547: 0,
			548: 0,
			549: 0,
			550: 0,
			551: 0,
			552: 0,
			553: 0,
			554: 0,
			555: 0,
			556: 0,
			557: 0,
			558: 0,
			559: 0,
			560: 0,
			561: 0,
			562: 0,
			563: 0,
			564: 0,
			565: 0,
			566: 0,
			567: 0,
			568: 0,
			569: 0,
			570: 0,
			571: 0,
			572: 0,
			573: 0,
			574: 0,
			575: 0,
			576: 0,
			577: 0,
			578: 0,
			579: 0,
			580: 0,
			581: 0,
			582: 0,
			583: 0,
			584: 0,
			585: 0,
			586: 0,
			587: 0,
			588: 0,
			589: 0,
			590: 0,
			591: 0,
			592: 0,
			593: 0,
			594: 0,
			595: 0,
			596: 0,
			597: 0,
			598: 0,
			599: 0,
			600: 0,
			601: 0,
			602: 0,
			603: 0,
			604: 0,
			605: 0,
			606: 0,
			607: 0,
			608: 0,
			609: 0,
			610: 0,
			611: 0,
			612: 0,
			613: 0,
			614: 0,
			615: 0,
			616: 0,
			617: 0,
			618: 0,
			619: 0,
			620: 0,
			621: 0,
			622: 0,
			623: 0,
			624: 0,
			625: 0,
			626: 0,
			627: 0,
			628: 0,
			629: 0,
			630: 0,
			631: 0,
			632: 0,
			633: 0,
			634: 0,
			635: 0,
			636: 0,
			637: 0,
			638: 0,
			639: 0,
			640: 0,
			641: 0,
			642: 0,
			643: 0,
			644: 0,
			645: 0,
			646: 0,
			647: 0,
			648: 0,
			649: 0,
			650: 0,
			651: 0,
			652: 0,
			653: 0,
			654: 0,
			655: 0,
			656: 0,
			657: 0,
			658: 0,
			659: 0,
			660: 0,
			661: 0,
			662: 0,
			663: 0,
			664: 0,
			665: 0,
			666: 0,
			667: 0,
			668: 0,
			669: 0,
			670: 0,
			671: 0,
			672: 0,
			673: 0,
			674: 0,
			675: 0,
			676: 0,
			677: 0,
			678: 0,
			679: 0,
			680: 0,
			681: 0,
			682: 0,
			683: 0,
			684: 0,
			685: 0,
			686: 0,
			687: 0,
			688: 0,
			689: 0,
			690: 0,
			691: 0,
			692: 0,
			693: 0,
			694: 0,
			695: 0,
			696: 0,
			697: 0,
			698: 0,
			699: 0,
			700: 0,
			701: 0,
			702: 0,
			703: 0,
			704: 0,
			705: 0,
			706: 0,
			707: 0,
			708: 0,
			709: 0,
			710: 0,
			711: 0,
			712: 0,
			713: 0,
			714: 0,
			715: 0,
			716: 0,
			717: 0,
			718: 0,
			719: 0,
			720: 0,
			721: 0,
			722: 0,
			723: 0,
			724: 0,
			725: 0,
			726: 0,
			727: 0,
			728: 0,
			729: 0,
			730: 0,
			731: 0,
			732: 0,
			733: 0,
			734: 0,
			735: 0,
			736: 0,
			737: 0,
			738: 0,
			739: 0,
			740: 0,
			741: 0,
			742: 0,
			743: 0,
			744: 0,
			745: 0,
			746: 0,
			747: 0,
			748: 0,
			749: 0,
			750: 0,
			751: 0,
			752: 0,
			753: 0,
			754: 0,
			755: 0,
			756: 0,
			757: 0,
			758: 0,
			759: 0,
			760: 0,
			761: 0,
			762: 0,
			763: 0,
			764: 0,
			765: 0,
			766: 0,
			767: 0,
			768: 0,
			769: 0,
			770: 0,
			771: 0,
			772: 0,
			773: 0,
			774: 0,
			775: 0,
			776: 0,
			777: 0,
			778: 0,
			779: 0,
			780: 0,
			781: 0,
			782: 0,
			783: 0,
			784: 0,
			785: 0,
			786: 0,
			787: 0,
			788: 0,
			789: 0,
			790: 0,
			791: 0,
			792: 0,
			793: 0,
			794: 0,
			795: 0,
			796: 0,
			797: 0,
			798: 0,
			799: 0,
			800: 0,
			801: 0,
			802: 0,
			803: 0,
			804: 0,
			805: 0,
			806: 0,
			807: 0,
			808: 0,
			809: 0,
			810: 0,
			811: 0,
			812: 0,
			813: 0,
			814: 0,
			815: 0,
			816: 0,
			817: 0,
			818: 0,
			819: 0,
			820: 0,
			821: 0,
			822: 0,
			823: 0,
			824: 0,
			825: 0,
			826: 0,
			827: 0,
			828: 0,
			829: 0,
			830: 0,
			831: 0,
			832: 0,
			833: 0,
			834: 0,
			835: 0,
			836: 0,
			837: 0,
			838: 0,
			839: 0,
			840: 0,
			841: 0,
			842: 0,
			843: 0,
			844: 0,
			845: 0,
			846: 0,
			847: 0,
			848: 0,
			849: 0,
			850: 0,
			851: 0,
			852: 0,
			853: 0,
			854: 0,
			855: 0,
			856: 0,
			857: 0,
			858: 0,
			859: 0,
			860: 0,
			861: 0,
			862: 0,
			863: 0,
			864: 0,
			865: 0,
			866: 0,
			867: 0,
			868: 0,
			869: 0,
			870: 0,
			871: 0,
			872: 0,
			873: 0,
			874: 0,
			875: 0,
			876: 0,
			877: 0,
			878: 0,
			879: 0,
			880: 0,
			881: 0,
			882: 0,
			883: 0,
			884: 0,
			885: 0,
			886: 0,
			887: 0,
			888: 0,
			889: 0,
			890: 0,
			891: 0,
			892: 0,
			893: 0,
			894: 0,
			895: 0,
			896: 0,
			897: 0,
			898: 0,
			899: 0,
			900: 0,
			901: 0,
			902: 0,
			903: 0,
			904: 0,
			905: 0,
			906: 0,
			907: 0,
			908: 0,
			909: 0,
			910: 0,
			911: 0,
			912: 0,
			913: 0,
			914: 0,
			915: 0,
			916: 0,
			917: 0,
			918: 0,
			919: 0,
			920: 0,
			921: 0,
			922: 0,
			923: 0,
			924: 0,
			925: 0,
			926: 0,
			927: 0,
			928: 0,
			929: 0,
			930: 0,
			931: 0,
			932: 0,
			933: 0,
			934: 0,
			935: 0,
			936: 0,
			937: 0,
			938: 0,
			939: 0,
			940: 0,
			941: 0,
			942: 0,
			943: 0,
			944: 0,
			945: 0,
			946: 0,
			947: 0,
			948: 0,
			949: 0,
			950: 0,
			951: 0,
			952: 0,
			953: 0,
			954: 0,
			955: 0,
			956: 0,
			957: 0,
			958: 0,
			959: 0,
			960: 0,
			961: 0,
			962: 0,
			963: 0,
			964: 0,
			965: 0,
			966: 0,
			967: 0,
			968: 0,
			969: 0,
			970: 0,
			971: 0,
			972: 0,
			973: 0,
			974: 0,
			975: 0,
			976: 0,
			977: 0,
			978: 0,
			979: 0,
			980: 0,
			981: 0,
			982: 0,
			983: 0,
			984: 0,
			985: 0,
			986: 0,
			987: 0,
			988: 0,
			989: 0,
			990: 0,
			991: 0,
			992: 0,
			993: 0,
			994: 0,
			995: 0,
			996: 0,
			997: 0,
			998: 0,
			999: 0,
			1000: 0,
			1001: 0,
			1002: 0,
			1003: 0,
			1004: 0,
			1005: 0,
			1006: 0,
			1007: 0,
			1008: 0,
			1009: 0,
			1010: 0,
			1011: 0,
			1012: 0,
			1013: 0,
			1014: 0,
			1015: 0,
			1016: 0,
			1017: 0,
			1018: 0,
			1019: 0,
			1020: 0,
			1021: 0,
			1022: 0,
			1023: 0,
			1024: 0,
			1025: 0,
			1026: 0,
			1027: 0,
			1028: 0,
			1029: 0,
			1030: 0,
			1031: 0,
			1032: 0,
			1033: 0,
			1034: 0,
			1035: 0,
			1036: 0,
			1037: 0,
			1038: 0,
			1039: 0,
			1040: 0,
			1041: 0,
			1042: 0,
			1043: 0,
			1044: 0,
			1045: 0,
			1046: 0,
			1047: 0,
			1048: 0,
			1049: 0,
			1050: 0,
			1051: 0,
			1052: 0,
			1053: 0,
			1054: 0,
			1055: 0,
			1056: 0,
			1057: 0,
			1058: 0,
			1059: 0,
			1060: 0,
			1061: 0,
			1062: 0,
			1063: 0,
			1064: 0,
			1065: 0,
			1066: 0,
			1067: 0,
			1068: 0,
			1069: 0,
			1070: 0,
			1071: 0,
			1072: 0,
			1073: 0,
			1074: 0,
			1075: 0,
			1076: 0,
			1077: 0,
			1078: 0,
			1079: 0,
			1080: 0,
			1081: 0,
			1082: 0,
			1083: 0,
			1084: 0,
			1085: 0,
			1086: 0,
			1087: 0,
			1088: 0,
			1089: 0,
			1090: 0,
			1091: 0,
			1092: 0,
			1093: 0,
			1094: 0,
			1095: 0,
			1096: 0,
			1097: 0,
			1098: 0,
			1099: 0,
			1100: 0,
			1101: 0,
			1102: 0,
			1103: 0,
			1104: 0,
			1105: 0,
			1106: 0,
			1107: 0,
			1108: 0,
			1109: 0,
			1110: 0,
			1111: 0,
			1112: 0,
			1113: 0,
			1114: 0,
			1115: 0,
			1116: 0,
			1117: 0,
			1118: 0,
			1119: 0,
			1120: 0,
			1121: 0,
			1122: 0,
			1123: 0,
			1124: 0,
			1125: 0,
			1126: 0,
			1127: 0,
			1128: 0,
			1129: 0,
			1130: 0,
			1131: 0,
			1132: 0,
			1133: 0,
			1134: 0,
			1135: 0,
			1136: 0,
			1137: 0,
			1138: 0,
			1139: 0,
			1140: 0,
			1141: 0,
			1142: 0,
			1143: 0,
			1144: 0,
			1145: 0,
			1146: 0,
			1147: 0,
			1148: 0,
			1149: 0,
			1150: 0,
			1151: 0,
			1152: 0,
			1153: 0,
			1154: 0,
			1155: 0,
			1156: 0,
			1157: 0,
			1158: 0,
			1159: 0,
			1160: 0,
			1161: 0,
			1162: 0,
			1163: 0,
			1164: 0,
			1165: 0,
			1166: 0,
			1167: 0,
			1168: 0,
			1169: 0,
			1170: 0,
			1171: 0,
			1172: 0,
			1173: 0,
			1174: 0,
			1175: 0,
			1176: 0,
			1177: 0,
			1178: 0,
			1179: 0,
			1180: 0,
			1181: 0,
			1182: 0,
			1183: 0,
			1184: 0,
			1185: 0,
			1186: 0,
			1187: 0,
			1188: 0,
			1189: 0,
			1190: 0,
			1191: 0,
			1192: 0,
			1193: 0,
			1194: 0,
			1195: 0,
			1196: 0,
			1197: 0,
			1198: 0,
			1199: 0,
			1200: 0,
			1201: 0,
			1202: 0,
			1203: 0,
			1204: 0,
			1205: 0,
			1206: 0,
			1207: 0,
			1208: 0,
			1209: 0,
			1210: 0,
			1211: 0,
			1212: 0,
			1213: 0,
			1214: 0,
			1215: 0,
			1216: 0,
			1217: 0,
			1218: 0,
			1219: 0,
			1220: 0,
			1221: 0,
			1222: 0,
			1223: 0,
			1224: 0,
			1225: 0,
			1226: 0,
			1227: 0,
			1228: 0,
			1229: 0,
			1230: 0,
			1231: 0,
			1232: 0,
			1233: 0,
			1234: 0,
			1235: 0,
			1236: 0,
			1237: 0,
			1238: 0,
			1239: 0,
			1240: 0,
			1241: 0,
			1242: 0,
			1243: 0,
			1244: 0,
			1245: 0,
			1246: 0,
			1247: 0,
			1248: 0,
			1249: 0,
			1250: 0,
			1251: 0,
			1252: 0,
			1253: 0,
			1254: 0,
			1255: 0,
			1256: 0,
			1257: 0,
			1258: 0,
			1259: 0,
			1260: 0,
			1261: 0,
			1262: 0,
			1263: 0,
			1264: 0,
			1265: 0,
			1266: 0,
			1267: 0,
			1268: 0,
			1269: 0,
			1270: 0,
			1271: 0,
			1272: 0,
			1273: 0,
			1274: 0,
			1275: 0,
			1276: 0,
			1277: 0,
			1278: 0,
			1279: 0,
			1280: 0,
			1281: 0,
			1282: 0,
			1283: 0,
			1284: 0,
			1285: 0,
			1286: 0,
			1287: 0,
			1288: 0,
			1289: 0,
			1290: 0,
			1291: 0,
			1292: 0,
			1293: 0,
			1294: 0,
			1295: 0,
			1296: 0,
			1297: 0,
			1298: 0,
			1299: 0,
			1300: 0,
			1301: 0,
			1302: 0,
			1303: 0,
			1304: 0,
			1305: 0,
			1306: 0,
			1307: 0,
			1308: 0,
			1309: 0,
			1310: 0,
			1311: 0,
			1312: 0,
			1313: 0,
			1314: 0,
			1315: 0,
			1316: 0,
			1317: 0,
			1318: 0,
			1319: 0,
			1320: 0,
			1321: 0,
			1322: 0,
			1323: 0,
			1324: 0,
			1325: 0,
			1326: 0,
			1327: 0,
			1328: 0,
			1329: 0,
			1330: 0,
			1331: 0,
			1332: 0,
			1333: 0,
			1334: 0,
			1335: 0,
			1336: 0,
			1337: 0,
			1338: 0,
			1339: 0,
			1340: 0,
			1341: 0,
			1342: 0,
			1343: 0,
			1344: 0,
			1345: 0,
			1346: 0,
			1347: 0,
			1348: 0,
			1349: 0,
			1350: 0,
			1351: 0,
			1352: 0,
			1353: 0,
			1354: 0,
			1355: 0,
			1356: 0,
			1357: 0,
			1358: 0,
			1359: 0,
			1360: 0,
			1361: 0,
			1362: 0,
			1363: 0,
			1364: 0,
			1365: 0,
			1366: 0,
			1367: 0,
			1368: 0,
			1369: 0,
			1370: 0,
			1371: 0,
			1372: 0,
			1373: 0,
			1374: 0,
			1375: 0,
			1376: 0,
			1377: 0,
			1378: 0,
			1379: 0,
			1380: 0,
			1381: 0,
			1382: 0,
			1383: 0,
			1384: 0,
			1385: 0,
			1386: 0,
			1387: 0,
			1388: 0,
			1389: 0,
			1390: 0,
			1391: 0,
			1392: 0,
			1393: 0,
			1394: 0,
			1395: 0,
			1396: 0,
			1397: 0,
			1398: 0,
			1399: 0,
			1400: 0,
			1401: 0,
			1402: 0,
			1403: 0,
			1404: 0,
			1405: 0,
			1406: 0,
			1407: 0,
			1408: 0,
			1409: 0,
			1410: 0,
			1411: 0,
			1412: 0,
			1413: 0,
			1414: 0,
			1415: 0,
			1416: 0,
			1417: 0,
			1418: 0,
			1419: 0,
			1420: 0,
			1421: 0,
			1422: 0,
			1423: 0,
			1424: 0,
			1425: 0,
			1426: 0,
			1427: 0,
			1428: 0,
			1429: 0,
			1430: 0,
			1431: 0,
			1432: 0,
			1433: 0,
			1434: 0,
			1435: 0,
			1436: 0,
			1437: 0,
			1438: 0,
			1439: 0,
			1440: 0,
			1441: 0,
			1442: 0,
			1443: 0,
			1444: 0,
			1445: 0,
			1446: 0,
			1447: 0,
			1448: 0,
			1449: 0,
			1450: 0,
			1451: 0,
			1452: 0,
			1453: 0,
			1454: 0,
			1455: 0,
			1456: 0,
			1457: 0,
			1458: 0,
			1459: 0,
			1460: 0,
			1461: 0,
			1462: 0,
			1463: 0,
			1464: 0,
			1465: 0,
			1466: 0,
			1467: 0,
			1468: 0,
			1469: 0,
			1470: 0,
			1471: 0,
			1472: 0,
			1473: 0,
			1474: 0,
			1475: 0,
			1476: 0,
			1477: 0,
			1478: 0,
			1479: 0,
			1480: 0,
			1481: 0,
			1482: 0,
			1483: 0,
			1484: 0,
			1485: 0,
			1486: 0,
			1487: 0,
			1488: 0,
			1489: 0,
			1490: 0,
			1491: 0,
			1492: 0,
			1493: 0,
			1494: 0,
			1495: 0,
			1496: 0,
			1497: 0,
			1498: 0,
			1499: 0,
			1500: 0,
			1501: 0,
			1502: 0,
			1503: 0,
			1504: 0,
			1505: 0,
			1506: 0,
			1507: 0,
			1508: 0,
			1509: 0,
			1510: 0,
			1511: 0,
			1512: 0,
			1513: 0,
			1514: 0,
			1515: 0,
			1516: 0,
			1517: 0,
			1518: 0,
			1519: 0,
			1520: 0,
			1521: 0,
			1522: 0,
			1523: 0,
			1524: 0,
			1525: 0,
			1526: 0,
			1527: 0,
		},
		macros: {
			0: 0,
			1: 1,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0,
			7: 0,
			8: 0,
			9: 0,
			10: 0,
			11: 0,
			12: 0,
			13: 0,
			14: 0,
			15: 0,
			16: 0,
			17: 0,
			18: 0,
			19: 0,
			20: 0,
			21: 0,
			22: 0,
			23: 0,
			24: 0,
			25: 0,
			26: 0,
			29: 0,
			30: 0,
			33: 0,
		},
		overrides: {
			0: false,
		},
	}

	beforeEach(() => {
		instance = new module('')
		instance.updateStatus = jest.fn()
		instance.log = jest.fn()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('init', () => {
		test('should initialize the device and update status', async () => {
			// Mock the necessary methods
			instance.initDevice = jest.fn()
			instance.updateVariableDefinitions = jest.fn()
			instance.updateActions = jest.fn()
			instance.updateFeedbacks = jest.fn()

			// Mock the config
			const config = { host: '127.0.0.1' }

			// Invoke the method
			await instance.init(config)

			// Assertions
			expect(instance.config).toEqual(config)
			expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.Ok)
			expect(instance.initDevice).toHaveBeenCalled()
			expect(instance.updateVariableDefinitions).toHaveBeenCalled()
			expect(instance.updateActions).toHaveBeenCalled()
			expect(instance.updateFeedbacks).toHaveBeenCalled()
		})
	})

	describe('initDevice', () => {
		test('should initialize the device when host is defined', async () => {
			// Mock the necessary methods and properties
			instance.config = { host: '127.0.0.1' }
			instance.updateStatus = jest.fn()
			instance.device = null

			// Invoke the method
			await instance.initDevice()

			// Assertions
			expect(instance.updateStatus).toHaveBeenCalledWith('connecting', 'Connecting')
			expect(Paradigm).toHaveBeenCalledWith('127.0.0.1')
			expect(instance.device.getAllInfo).toHaveBeenCalled()
			expect(instance.updateStatus).toHaveBeenCalledWith('ok')
		})

		test('should not initialize the device when host is undefined', async () => {
			// Mock the necessary methods and properties
			instance.config = {}
			instance.updateStatus = jest.fn()
			instance.device = null

			// Invoke the method
			await instance.initDevice()

			// Assertions
			expect(instance.updateStatus).not.toHaveBeenCalled()
			expect(Paradigm).not.toHaveBeenCalled()
		})

		test('should handle error and update status when an exception occurs', async () => {
			// Mock the necessary methods and properties
			instance.config = { host: '127.0.0.1' }
			instance.updateStatus = jest.fn()
			instance.log = jest.fn()
			instance.device = null
            instance.unsubscribeToDevice = jest.fn()

			// Mock the error
			const mockError = new Error('Some error message')
			Paradigm.mockImplementationOnce(() => {
				throw mockError
			})

			// Invoke the method
			await instance.initDevice()

			// Assertions
			expect(instance.updateStatus).toHaveBeenCalledWith('error', mockError.message)
			expect(instance.log).toHaveBeenCalledWith('error', 'Network error: ' + mockError.message)
			expect(instance.device).toBeUndefined()
			expect(instance.deviceInfo).toEqual({})
			expect(instance.unsubscribeToDevice).toHaveBeenCalled()
		})

        test('should handle error and update status when timeout happens', async () => {
			// Mock the necessary methods and properties
			instance.config = { host: '127.0.0.1' }
			instance.updateStatus = jest.fn()
			instance.log = jest.fn()
			instance.device = null
            instance.unsubscribeToDevice = jest.fn()

			// Mock the error
			const mockError = new Error('This operation was aborted')
			Paradigm.mockImplementationOnce(() => {
				throw mockError
			})

			// Invoke the method
			await instance.initDevice()

			// Assertions
			expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.Disconnected)
			expect(instance.device).toBeUndefined()
			expect(instance.deviceInfo).toEqual({})
			expect(instance.unsubscribeToDevice).toHaveBeenCalled()
		})
	})

	describe('destroy', () => {
		test('should unsubscribe from device and reset properties', () => {
			// Mock the necessary methods and properties
			instance.unsubscribeToDevice = jest.fn()

			// Invoke the method
			instance.destroy()

			// Assertions
			expect(instance.unsubscribeToDevice).toHaveBeenCalled()
			expect(instance.device).toBeUndefined()
			expect(instance.deviceInfo).toEqual({})
			expect(instance.log).toHaveBeenCalledWith('debug', 'destroy')
		})
	})

	describe('configUpdated', () => {
		test('should update the config and initialize the device', async () => {
			// Mock the necessary methods
			instance.unsubscribeToDevice = jest.fn()
			instance.initDevice = jest.fn()
            instance.config = { host: '10.101.101.101' }

			// Mock the config
			const config = { host: '127.0.0.1' }

			// Invoke the method
			await instance.configUpdated(config)

			// Assertions
			expect(instance.config).toEqual(config)
			expect(instance.unsubscribeToDevice).toHaveBeenCalled()
			expect(instance.initDevice).toHaveBeenCalled()
		})
	})

	describe('getConfigFields', () => {
		test('should return an array of config fields', () => {
			// Invoke the method
			const configFields = instance.getConfigFields()

			// Assertions
			expect(Array.isArray(configFields)).toBe(true)
			expect(configFields.length).toBe(2)
			expect(configFields[0]).toEqual({
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: "/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/",
			})
			expect(configFields[1]).toEqual({
				id: 'pollFrequency',
				type: 'number',
				label: 'Polling Time (ms)',
				default: 5000,
				min: 200,
				max: 10000,
			})
		})
	})

	describe('getStates', () => {
		test('should update variable values and check feedbacks', async () => {
			// Mock the necessary methods and properties
            const realParadigm = jest.requireActual('../paradigm')
			instance.device = {
                getControlStatus: jest.fn().mockResolvedValue(controlStatus),
                features: new realParadigm('test').features
            }
			instance.buildVariablesValuesFromControlStatus = jest.fn().mockReturnValue({})
			instance.setVariableValues = jest.fn()
			instance.checkFeedbacks = jest.fn()

			// Invoke the method
			await instance.getStates()

			// Assertions
			expect(instance.device.getControlStatus).toHaveBeenCalled()
			expect(instance.buildVariablesValuesFromControlStatus).toHaveBeenCalledTimes(6)
			expect(instance.setVariableValues).toHaveBeenCalled()
			expect(instance.checkFeedbacks).toHaveBeenCalled()
		})
	})

	describe('buildVariablesValuesFromControlStatus', () => {
		test('should build variables values from control status', () => {
			const info = controlStatus.presets
			const variables = {}
			const feature = 'presets'
			const text = 'name'
			const ending = '_state'

			const result = instance.buildVariablesValuesFromControlStatus(info, variables, feature, text, ending)

			expect(result).toEqual({
				presets_2_state: 'Deactivated',
				presets_3_state: 'Deactivated',
				presets_4_state: 'Activated',
				presets_5_state: 'Deactivated',
				presets_6_state: 'Deactivated',
				presets_7_state: 'Deactivated',
				presets_8_state: 'Deactivated',
				presets_9_state: 'Deactivated',
				presets_10_state: 'Deactivated',
				presets_11_state: 'Deactivated',
				presets_12_state: 'Deactivated',
				presets_13_state: 'Deactivated',
				presets_14_state: 'Deactivated',
				presets_15_state: 'Deactivated',
				presets_16_state: 'Altered',
				presets_17_state: 'Deactivated',
				presets_18_state: 'Deactivated',
				presets_19_state: 'Deactivated',
				presets_20_state: 'Altered',
				presets_21_state: 'Deactivated',
				presets_22_state: 'Altered',
				presets_23_state: 'Deactivated',
				presets_24_state: 'Deactivated',
				presets_25_state: 'Deactivated',
				presets_26_state: 'Deactivated',
				presets_27_state: 'Deactivated',
				presets_28_state: 'Deactivated',
				presets_29_state: 'Deactivated',
				presets_30_state: 'Deactivated',
				presets_31_state: 'Deactivated',
				presets_32_state: 'Deactivated',
				presets_33_state: 'Deactivated',
				presets_34_state: 'Deactivated',
				presets_35_state: 'Deactivated',
				presets_36_state: 'Deactivated',
				presets_37_state: 'Deactivated',
				presets_39_state: 'Deactivated',
				presets_40_state: 'Deactivated',
				presets_41_state: 'Deactivated',
				presets_42_state: 'Deactivated',
				presets_43_state: 'Deactivated',
			})
		})
	})

    // This should probably run better tests
	describe('setupChoices', () => {
		test('should set up choices when device is loaded', () => {
            instance.deviceInfo = {
                macros: []
            }
			instance.buildChoices = jest.fn().mockReturnValue([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			instance.buildChoicesWithSpaces = jest.fn().mockReturnValue([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])

			instance.setupChoices()

			expect(instance.CHOICES_MACROS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_PRESETS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_WALLS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_SEQUENCES).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_CHANNELS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_OVERRIDES).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
		})

		test('should set up choices when device is not loaded', () => {
			instance.buildChoices = jest.fn().mockReturnValue([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			instance.buildChoicesWithSpaces = jest.fn().mockReturnValue([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])

			instance.deviceInfo = {}

			instance.setupChoices()

			expect(instance.CHOICES_MACROS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_PRESETS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_WALLS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_SEQUENCES).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_CHANNELS).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
			expect(instance.CHOICES_OVERRIDES).toEqual([
				{ id: 1, label: 'Choice 1' },
				{ id: 2, label: 'Choice 2' },
			])
		})
	})

	describe('buildChoices', () => {
		test('should build choices without a feature', () => {
			const info = [
				{
					id: 0,
					name: 'OVERRIDE',
					state: 0,
				},
				{
					id: 1,
					name: 'HOUSE 100',
					state: 0,
				},
				{
					id: 2,
					name: 'HOUSE 75',
					state: 0,
				},
				{
					id: 3,
					name: 'HOUSE 50',
					state: 1,
				},
				{
					id: 4,
					name: 'HOUSE 25',
					state: 0,
				},
				{
					id: 5,
					name: 'HOUSE OFF',
					state: 0,
				},
				{
					id: 6,
					name: 'STATION LOCKOUT',
					state: 1,
				},
				{
					id: 7,
					name: 'GLOBAL OFF',
					state: 0,
				},
			]
			const feature = ''

			const result = instance.buildChoices(info, feature)

			expect(result).toEqual([
				{ id: '0', label: 'OVERRIDE' },
				{ id: '1', label: 'HOUSE 100' },
				{
					id: '2',
					label: 'HOUSE 75',
				},
				{
					id: '3',
					label: 'HOUSE 50',
				},
				{
					id: '4',
					label: 'HOUSE 25',
				},
				{
					id: '5',
					label: 'HOUSE OFF',
				},
				{
					id: '6',
					label: 'STATION LOCKOUT',
				},
				{
					id: '7',
					label: 'GLOBAL OFF',
				},
			])
		})

		test('should build choices with a feature and a count', () => {
			const info = []
			const feature = 'Feature'
            const count = 2

			const result = instance.buildChoices(info, feature, count)

			expect(result).toEqual([
				{ id: '0', label: 'Feature 1' },
				{ id: '1', label: 'Feature 2' },
			])
		})

		// test('should build choices with a specified count', () => {
		// 	const info = {
		// 		1: { id: 1, name: 'Choice 1' },
		// 		2: { id: 2, name: 'Choice 2' },
		// 	}
		// 	const feature = ''
		// 	const count = 1

		// 	const result = instance.buildChoices(info, feature, count)

		// 	expect(result).toEqual([{ id: 1, label: 'Choice 1' }])
		// })
	})

	describe('buildChoicesWithSpaces', () => {
		test('should build channel choices with spaces without a feature', () => {
			const info = [
				{ id: 0, name: 'Channel 1', space: 0 },
				{ id: 1, name: 'Channel 2', space: 1 },
            ]
			const spaces = {
				"0": 'Space 1',
				"1": 'Space 2',
			}
			const feature = ''

			const result = instance.buildChannelChoicesWithSpaces(info, spaces, feature)

			expect(result).toEqual([
				{ id: "0", label: 'Space 1: Channel 1' },
				{ id: "1", label: 'Space 2: Channel 2' },
			])
		})

		// test('should build channel choices with spaces with a specified count', () => {
		// 	const info = {
		// 		1: { id: 1, name: 'Channel 1', space: 1 },
		// 		2: { id: 2, name: 'Channel 2', space: 2 },
		// 	}
		// 	const spaces = {
		// 		1: 'Space 1',
		// 		2: 'Space 2',
		// 	}
		// 	const feature = ''
		// 	const count = 1

		// 	const result = instance.buildChannelChoicesWithSpaces(info, spaces, feature, count)

		// 	expect(result).toEqual([{ id: 1, label: 'Space 1: Channel 1' }])
		// })
	})
})
