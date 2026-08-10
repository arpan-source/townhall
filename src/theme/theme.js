import { createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "indigo",

  defaultRadius: "md",

  fontFamily:
    "Inter, sans-serif",

  colors: {
    dark: [
      "#C9D1D9",
      "#B0BAC5",
      "#8B949E",
      "#6E7681",
      "#484F58",
      "#30363D",
      "#21262D",
      "#161B22",
      "#0F172A",
      "#020617",
    ],
  },

  primaryShade: 6,

  components: {

    Drawer: {
      defaultProps: {
        radius: "md",
        shadow: "xl",
        padding: "xl",
      },

      styles: {
        content: {
          backgroundColor: "#020617",
          borderLeft: "1px solid #1E293B",
        },

        header: {
          backgroundColor: "#020617",
          borderBottom: "1px solid #1E293B",
        },

        title: {
          color: "white",
          fontWeight: 600,
        },
      },
    },

    Modal: {
      defaultProps: {
        centered: true,
        radius: "md",
        shadow: "xl",
      },

      styles: {
        content: {
          backgroundColor: "#020617",
        },

        header: {
          backgroundColor: "#020617",
        },

        title: {
          color: "white",
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },

      styles: {
        root: {
          backgroundColor: "#0F172A",
          border: "1px solid #1E293B",
        },
      },
    },

    Button: {
      defaultProps: {
        radius: "md",
      },
    },

    TextInput: {
      styles: {
        input: {
          backgroundColor: "#0F172A",
          color: "white",
          borderColor: "#334155",
        },

        label: {
          color: "#CBD5E1",
        },
      },
    },

    Textarea: {
      styles: {
        input: {
          backgroundColor: "#0F172A",
          color: "white",
          borderColor: "#334155",
        },

        label: {
          color: "#CBD5E1",
        },
      },
    },

    Select: {
      styles: {
        input: {
          backgroundColor: "#0F172A",
          color: "white",
          borderColor: "#334155",
        },

        label: {
          color: "#CBD5E1",
        },
      },
    },

    NumberInput: {
      styles: {
        input: {
          backgroundColor: "#0F172A",
          color: "white",
          borderColor: "#334155",
        },

        label: {
          color: "#CBD5E1",
        },
      },
    },
  },
});

export default theme;