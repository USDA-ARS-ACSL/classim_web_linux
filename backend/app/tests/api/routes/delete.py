import requests
lon="-76.9242585"
lat="39.0248341	"
lonLat = str(lon) + " " + str(lat)
url="https://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService.asmx"
headers = {'content-type': 'text/xml'}
body = """<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:sdm="http://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService.asmx">
            <soap:Header/>
            <soap:Body>
                <sdm:RunQuery>
                    <sdm:Query>SELECT co.cokey as cokey, ch.chkey as chkey, comppct_r as prcent, slope_r, slope_h as slope, hzname, hzdepb_r as depth, 
                                awc_r as awc, claytotal_r as clay, silttotal_r as silt, sandtotal_r as sand, om_r as OM, dbthirdbar_r as dbthirdbar, 
                                wthirdbar_r/100 as th33, (dbthirdbar_r-(wthirdbar_r/100)) as bd FROM sacatalog sc
                                FULL OUTER JOIN legend lg  ON sc.areasymbol=lg.areasymbol
                                FULL OUTER JOIN mapunit mu ON lg.lkey=mu.lkey
                                FULL OUTER JOIN component co ON mu.mukey=co.mukey
                                FULL OUTER JOIN chorizon ch ON co.cokey=ch.cokey
                                FULL OUTER JOIN chtexturegrp ctg ON ch.chkey=ctg.chkey
                                FULL OUTER JOIN chtexture ct ON ctg.chtgkey=ct.chtgkey
                                FULL OUTER JOIN copmgrp pmg ON co.cokey=pmg.cokey
                                FULL OUTER JOIN corestrictions rt ON co.cokey=rt.cokey
                                WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point(""" + lonLat + """)')) order by co.cokey, ch.chkey, prcent, depth
                    </sdm:Query>
                </sdm:RunQuery>
            </soap:Body>
            </soap:Envelope>"""

response = requests.post(url,data=body,headers=headers)
print(response.content)