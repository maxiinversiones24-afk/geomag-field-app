#include <emscripten/emscripten.h>
#include <stddef.h>
#include "GeomagnetismHeader.h"

/*
 lat, lon en grados
 height en metros
 decimalYear = año decimal (NOAA)
 devuelve F (nT)
*/

EMSCRIPTEN_KEEPALIVE
double wmm_compute(
    double lat,
    double lon,
    double height,
    double decimalYear
) {
    MAGtype_Ellipsoid Ellip;
    MAGtype_Geoid Geoid;
    MAGtype_CoordGeodetic Geo;
    MAGtype_CoordSpherical Sph;
    MAGtype_Date Date;
    MAGtype_MagneticModel *Model = NULL;
    MAGtype_MagneticModel *TimedModel = NULL;
    MAGtype_GeoMagneticElements Elements, Errors;
    char Error[256];

    MAG_SetDefaults(&Ellip, &Geoid);

    Geo.phi = lat;
    Geo.lambda = lon;
    Geo.HeightAboveEllipsoid = height / 1000.0;
    Geo.UseGeoid = 0;

    Date.DecimalYear = decimalYear;

    Model = MAG_AllocateModelMemory(13);
    MAG_readMagneticModel("WMM.COF", Model);

    TimedModel = MAG_AllocateModelMemory(Model->nMax);
    MAG_TimelyModifyMagneticModel(Date, Model, TimedModel);

    MAG_GeodeticToSpherical(Ellip, Geo, &Sph);
    MAG_Geomag(Ellip, Sph, Geo, TimedModel, &Elements);

    double F = Elements.F;

    MAG_FreeMagneticModelMemory(Model);
    MAG_FreeMagneticModelMemory(TimedModel);

    return F;
}
