import React from 'react';
import { createStyles } from '@mantine/core';

export function LanguageLogo() {
  const { classes } = useStyles();

  return (
    <div>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="22pt"
        height="22pt"
        fill="none"
        viewBox="0 0 512.000000 512.000000"
        preserveAspectRatio="xMidYMid meet"
        style={{ marginLeft: '6px' }}
      >
        <g
          transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
          fill="none"
          stroke="none"
        >
          <path
            className={classes.c}
            d="M361 5109 c-172 -34 -318 -182 -351 -358 -14 -74 -14 -3398 0 -3472
             34 -180 179 -325 359 -359 33 -6 302 -10 700 -10 l647 0 23 -197 c39 -337 47
             -381 86 -459 38 -78 124 -168 195 -204 99 -51 75 -50 1421 -50 813 0 1275 4
             1310 10 180 34 325 179 359 359 14 74 14 3398 0 3472 -30 156 -133 278 -289
             341 l-56 23 -1130 5 -1130 5 -32 260 c-18 143 -37 280 -43 304 -27 107 -122
             232 -218 284 -104 57 -104 57 -992 56 -448 -1 -835 -5 -859 -10z m1717 -317
             c18 -13 39 -37 48 -54 11 -21 81 -557 230 -1752 117 -946 216 -1733 218 -1748
             l6 -28 -1081 0 c-1062 0 -1080 0 -1119 20 -26 13 -47 34 -60 60 -20 39 -20 55
             -20 1725 0 1669 0 1686 20 1725 12 24 35 47 58 59 36 20 56 20 852 18 l815 -2
             33 -23z m2662 -902 c26 -13 47 -34 60 -60 20 -39 20 -55 20 -1725 0 -1670 0
             -1686 -20 -1725 -13 -26 -34 -47 -60 -60 -39 -20 -53 -20 -1243 -18 l-1204 3
             294 340 c198 229 296 351 303 374 7 27 -29 345 -165 1440 -96 773 -176 1416
             -178 1429 l-4 22 1079 0 c1061 0 1079 0 1118 -20z m-2488 -3173 c-92 -107
             -171 -195 -177 -196 -8 -1 -52 292 -54 367 l-1 22 200 0 200 0 -168 -193z"
          />
          <path
            className={classes.c}
            d="M1150 4044 c-73 -30 -70 -18 -236 -851 -85 -422 -154 -778 -154 -790
               0 -69 77 -143 150 -143 49 0 107 35 128 78 11 20 41 146 67 280 l48 242 207 0
               207 0 48 -242 c26 -134 56 -260 67 -280 21 -43 79 -78 128 -78 73 0 150 74
               150 143 0 12 -69 368 -154 790 -167 837 -163 821 -239 852 -52 21 -366 21
               -417 -1z m297 -584 l60 -300 -147 0 -147 0 60 300 60 300 27 0 27 0 60 -300z"
          />
          <path
            className={classes.c}
            d="M3688 3139 c-58 -30 -78 -79 -78 -189 l0 -90 -240 0 c-222 0 -244 -2
              -280 -20 -45 -23 -80 -80 -80 -130 0 -77 74 -150 152 -150 32 0 34 -3 57 -67
              65 -183 167 -373 278 -518 l53 -70 -47 -43 c-27 -24 -107 -91 -179 -148 -86
              -69 -136 -117 -147 -140 -60 -125 74 -261 196 -197 34 17 159 115 297 231 46
              40 87 72 90 72 3 0 44 -32 90 -72 138 -116 263 -214 297 -231 93 -48 213 27
              213 132 0 60 -30 97 -164 205 -72 57 -152 124 -179 148 l-47 43 53 70 c111
              145 213 335 278 518 23 64 25 67 57 67 78 0 152 73 152 150 0 50 -35 107 -80
              130 -36 18 -58 20 -280 20 l-240 0 0 90 c0 112 -20 159 -80 190 -49 25 -94 25
              -142 -1z m312 -591 c-1 -47 -214 -418 -240 -418 -26 0 -239 371 -240 418 0 9
              55 12 240 12 185 0 240 -3 240 -12z"
          />
        </g>
      </svg>
    </div>
  );
}

const useStyles = createStyles((theme) => ({
  root: {
    height: 30,
    [theme.fn.smallerThan('sm')]: {
      overflow: 'hidden',
      height: 45,
      width: 45,
    },
  },
  svg: {
    height: 30,
    [theme.fn.smallerThan('sm')]: {
      height: 45,
    },
  },
  c: {
    fill: theme.colorScheme === 'dark' ? '#FFFFFF' : '#868e96',
  },

  ivit: {
    fill: theme.colorScheme === 'dark' ? theme.colors.dark[0] : '#868e96',
  },

  ai: {
    fill: theme.colors.blue[8],
  },

  accent: {
    fill: theme.colors.blue[8],
  },

  text: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  badge: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));
