import React from 'react';
import { Link } from "react-router-dom";

import clx from "classnames";
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { makeStyles, Icon } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    color: 'white',
    height: 45,
    marginTop: '30px',
    fontSize: '30px'
  }
}));

const GridLayout = ({ routes, pathName, classes }) => {

  const routeFilter = routes.filter(r => (r.layout === pathName || r.layout === `${pathName}/`));

  const iconClasses = useStyles();

  return (
    <>
    {(routeFilter.length > 0) ?
      <Grid container spacing={{ xs: 10, md: 2 }} columns={{ xs: 4, sm: 4, md: 12 }}>
        {

          // eslint-disable-next-line array-callback-return
          routeFilter.map((layoutItem, layoutIndex) => {

            const layoutName = layoutItem.name;

            return (

              <Grid item xs={2} sm={2} md={4} key={layoutIndex} style={{ 'display': 'grid', 'height': '25vh' }}>
                <Link to={{ pathname: `${pathName}/${layoutName}` }} >

                  <Paper
                    className="layout-component"
                    style={{ backgroundColor: '#194175', alignItems: "center", fontWeight: 'normal', fontSize: '18px', borderRadius: '20px', color: 'white', height: '150px' }}>

                    <div id={`${layoutIndex}`} style={{ textAlign: "center", height: '50px', width: '100%', marginTop: '75px' }}>

                      {(typeof layoutItem.icon === "string" ?
                        (
                          <Icon
                            classes={{
                              root: iconClasses.root,
                            }}
                            className={iconClasses.root}
                          >
                            {layoutItem.icon}
                          </Icon>
                        )
                        :
                        (
                          <layoutItem.icon
                            classes={{
                              root: iconClasses.root
                            }}
                            className={iconClasses.root}
                          />
                        )
                      )}
                    </div>

                    <div id={layoutName} style={{ color: '#fdeed5', textAlign: "center", height: '50px', width: '100%', marginTop: '25px' }}>
                      {layoutName}
                    </div>

                  </Paper>

                </Link>
              </Grid>

            );

          })
        }

      </Grid>: null 
    }
    </>
  );
};

export default GridLayout;