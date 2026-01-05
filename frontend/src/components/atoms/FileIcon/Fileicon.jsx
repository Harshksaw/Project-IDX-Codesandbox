import { 
    FaCss3, 
    FaHtml5, 
    FaJs, 
    FaPython, 
    FaJava, 
    FaPhp,
    FaGitAlt,
    FaDocker,
    FaMarkdown,
    FaNpm,
    FaYarn,
    FaSass,
    FaLess,
    FaVuejs,
    FaAngular,
    FaNodeJs,
    FaRust
} from "react-icons/fa";
import { 
    FaGolang 
} from "react-icons/fa6";
import { GrReactjs } from "react-icons/gr";
import { 
    SiTypescript, 
    SiJson, 
    SiSvelte,
    SiTailwindcss,
    SiPrisma,
    SiGraphql,
    SiYaml,
    SiToml,
    SiDotenv,
    SiEslint,
    SiPrettier,
    SiWebpack,
    SiVite,
    SiNextdotjs,
    SiNuxtdotjs,
    SiAstro,
    SiMongodb,
    SiPostgresql,
    SiRedis,
    SiKotlin,
    SiSwift,
    SiCplusplus,
    SiRuby,
    SiLua,
    SiPerl,
    SiScala,
    SiElixir,
    SiHaskell,
    SiClojure,
    SiDart,
    SiFlutter,
    SiSolidity,
    SiAssemblyscript,
    SiDotnet
} from "react-icons/si";
import { 
    VscFile, 
    VscJson, 
    VscSettingsGear,
    VscLock,
    VscTerminalBash,
    VscFileCode,
    VscFilePdf,
    VscFileMedia,
    VscFileZip,
    VscDatabase
} from "react-icons/vsc";
import { 
    BiLogoVisualStudio 
} from "react-icons/bi";
import { 
    TbBrandCpp,
    TbSql,
    TbFileTypeTxt,
    TbFileTypeCsv,
    TbFileTypeXml,
    TbCoffee
} from "react-icons/tb";
import "./FileIcon.css";

export const FileIcon = ({ extension, fileName = "" }) => {
    const lowerExt = extension?.toLowerCase();
    const lowerFileName = fileName?.toLowerCase();

    // Special file name mappings (highest priority)
    const fileNameIcons = {
        // Config files
        "package.json": { icon: FaNpm, color: "#cb3837", label: "npm" },
        "package-lock.json": { icon: FaNpm, color: "#cb3837", label: "npm lock" },
        "yarn.lock": { icon: FaYarn, color: "#2c8ebb", label: "yarn" },
        ".yarnrc": { icon: FaYarn, color: "#2c8ebb", label: "yarn" },
        "tsconfig.json": { icon: SiTypescript, color: "#3178c6", label: "TypeScript config" },
        "jsconfig.json": { icon: FaJs, color: "#f7df1e", label: "JavaScript config" },
        ".eslintrc": { icon: SiEslint, color: "#4b32c3", label: "ESLint" },
        ".eslintrc.js": { icon: SiEslint, color: "#4b32c3", label: "ESLint" },
        ".eslintrc.json": { icon: SiEslint, color: "#4b32c3", label: "ESLint" },
        "eslint.config.js": { icon: SiEslint, color: "#4b32c3", label: "ESLint" },
        ".prettierrc": { icon: SiPrettier, color: "#f7b93e", label: "Prettier" },
        ".prettierrc.js": { icon: SiPrettier, color: "#f7b93e", label: "Prettier" },
        "prettier.config.js": { icon: SiPrettier, color: "#f7b93e", label: "Prettier" },
        "webpack.config.js": { icon: SiWebpack, color: "#8dd6f9", label: "Webpack" },
        "vite.config.js": { icon: SiVite, color: "#646cff", label: "Vite" },
        "vite.config.ts": { icon: SiVite, color: "#646cff", label: "Vite" },
        "next.config.js": { icon: SiNextdotjs, color: "#ffffff", label: "Next.js" },
        "next.config.mjs": { icon: SiNextdotjs, color: "#ffffff", label: "Next.js" },
        "nuxt.config.js": { icon: SiNuxtdotjs, color: "#00dc82", label: "Nuxt" },
        "nuxt.config.ts": { icon: SiNuxtdotjs, color: "#00dc82", label: "Nuxt" },
        "astro.config.mjs": { icon: SiAstro, color: "#ff5d01", label: "Astro" },
        "tailwind.config.js": { icon: SiTailwindcss, color: "#06b6d4", label: "Tailwind" },
        "tailwind.config.ts": { icon: SiTailwindcss, color: "#06b6d4", label: "Tailwind" },
        "postcss.config.js": { icon: VscSettingsGear, color: "#dd3a0a", label: "PostCSS" },
        ".gitignore": { icon: FaGitAlt, color: "#f05032", label: "Git ignore" },
        ".gitattributes": { icon: FaGitAlt, color: "#f05032", label: "Git attributes" },
        "dockerfile": { icon: FaDocker, color: "#2496ed", label: "Docker" },
        "docker-compose.yml": { icon: FaDocker, color: "#2496ed", label: "Docker Compose" },
        "docker-compose.yaml": { icon: FaDocker, color: "#2496ed", label: "Docker Compose" },
        ".dockerignore": { icon: FaDocker, color: "#2496ed", label: "Docker ignore" },
        ".env": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        ".env.local": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        ".env.development": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        ".env.production": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        ".env.example": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        "prisma.schema": { icon: SiPrisma, color: "#2d3748", label: "Prisma" },
        "schema.prisma": { icon: SiPrisma, color: "#2d3748", label: "Prisma" },
        "readme.md": { icon: FaMarkdown, color: "#083fa1", label: "Readme" },
        "license": { icon: VscLock, color: "#d4af37", label: "License" },
        "license.md": { icon: VscLock, color: "#d4af37", label: "License" },
        ".nvmrc": { icon: FaNodeJs, color: "#339933", label: "Node version" },
        ".node-version": { icon: FaNodeJs, color: "#339933", label: "Node version" },
    };

    // Extension-based icon mappings
    const extensionIcons = {
        // JavaScript/TypeScript
        "js": { icon: FaJs, color: "#f7df1e", label: "JavaScript" },
        "mjs": { icon: FaJs, color: "#f7df1e", label: "JavaScript Module" },
        "cjs": { icon: FaJs, color: "#f7df1e", label: "CommonJS" },
        "jsx": { icon: GrReactjs, color: "#61dafb", label: "React JSX" },
        "ts": { icon: SiTypescript, color: "#3178c6", label: "TypeScript" },
        "tsx": { icon: GrReactjs, color: "#3178c6", label: "React TSX" },
        "d.ts": { icon: SiTypescript, color: "#3178c6", label: "TypeScript Declaration" },
        
        // Web
        "html": { icon: FaHtml5, color: "#e34f26", label: "HTML" },
        "htm": { icon: FaHtml5, color: "#e34f26", label: "HTML" },
        "css": { icon: FaCss3, color: "#1572b6", label: "CSS" },
        "scss": { icon: FaSass, color: "#cc6699", label: "SCSS" },
        "sass": { icon: FaSass, color: "#cc6699", label: "Sass" },
        "less": { icon: FaLess, color: "#1d365d", label: "Less" },
        "styl": { icon: VscFileCode, color: "#ff6347", label: "Stylus" },
        
        // Frameworks
        "vue": { icon: FaVuejs, color: "#4fc08d", label: "Vue" },
        "svelte": { icon: SiSvelte, color: "#ff3e00", label: "Svelte" },
        "angular": { icon: FaAngular, color: "#dd0031", label: "Angular" },
        "astro": { icon: SiAstro, color: "#ff5d01", label: "Astro" },
        
        // Data formats
        "json": { icon: SiJson, color: "#cbcb41", label: "JSON" },
        "json5": { icon: SiJson, color: "#cbcb41", label: "JSON5" },
        "yaml": { icon: SiYaml, color: "#cb171e", label: "YAML" },
        "yml": { icon: SiYaml, color: "#cb171e", label: "YAML" },
        "toml": { icon: SiToml, color: "#9c4121", label: "TOML" },
        "xml": { icon: TbFileTypeXml, color: "#e37933", label: "XML" },
        "csv": { icon: TbFileTypeCsv, color: "#89e051", label: "CSV" },
        "graphql": { icon: SiGraphql, color: "#e535ab", label: "GraphQL" },
        "gql": { icon: SiGraphql, color: "#e535ab", label: "GraphQL" },
        
        // Markdown & Docs
        "md": { icon: FaMarkdown, color: "#083fa1", label: "Markdown" },
        "mdx": { icon: FaMarkdown, color: "#f9ac00", label: "MDX" },
        "txt": { icon: TbFileTypeTxt, color: "#89e051", label: "Text" },
        "pdf": { icon: VscFilePdf, color: "#ff0000", label: "PDF" },
        
        // Programming Languages
        "py": { icon: FaPython, color: "#3776ab", label: "Python" },
        "pyw": { icon: FaPython, color: "#3776ab", label: "Python" },
        "ipynb": { icon: FaPython, color: "#f37626", label: "Jupyter Notebook" },
        "java": { icon: FaJava, color: "#007396", label: "Java" },
        "class": { icon: FaJava, color: "#007396", label: "Java Class" },
        "jar": { icon: FaJava, color: "#007396", label: "Java Archive" },
        "kt": { icon: SiKotlin, color: "#7f52ff", label: "Kotlin" },
        "kts": { icon: SiKotlin, color: "#7f52ff", label: "Kotlin Script" },
        "swift": { icon: SiSwift, color: "#f05138", label: "Swift" },
        "go": { icon: FaGolang, color: "#00add8", label: "Go" },
        "rs": { icon: FaRust, color: "#dea584", label: "Rust" },
        "c": { icon: TbBrandCpp, color: "#a8b9cc", label: "C" },
        "h": { icon: TbBrandCpp, color: "#a8b9cc", label: "C Header" },
        "cpp": { icon: SiCplusplus, color: "#00599c", label: "C++" },
        "cc": { icon: SiCplusplus, color: "#00599c", label: "C++" },
        "cxx": { icon: SiCplusplus, color: "#00599c", label: "C++" },
        "hpp": { icon: SiCplusplus, color: "#00599c", label: "C++ Header" },
        "cs": { icon: SiDotnet, color: "#512bd4", label: "C#" },
        "php": { icon: FaPhp, color: "#777bb4", label: "PHP" },
        "rb": { icon: SiRuby, color: "#cc342d", label: "Ruby" },
        "erb": { icon: SiRuby, color: "#cc342d", label: "ERB" },
        "lua": { icon: SiLua, color: "#000080", label: "Lua" },
        "pl": { icon: SiPerl, color: "#39457e", label: "Perl" },
        "pm": { icon: SiPerl, color: "#39457e", label: "Perl Module" },
        "scala": { icon: SiScala, color: "#dc322f", label: "Scala" },
        "ex": { icon: SiElixir, color: "#4e2a8e", label: "Elixir" },
        "exs": { icon: SiElixir, color: "#4e2a8e", label: "Elixir Script" },
        "erl": { icon: VscFileCode, color: "#a90533", label: "Erlang" },
        "hs": { icon: SiHaskell, color: "#5e5086", label: "Haskell" },
        "clj": { icon: SiClojure, color: "#5881d8", label: "Clojure" },
        "cljs": { icon: SiClojure, color: "#5881d8", label: "ClojureScript" },
        "dart": { icon: SiDart, color: "#0175c2", label: "Dart" },
        "sol": { icon: SiSolidity, color: "#363636", label: "Solidity" },
        "asm": { icon: SiAssemblyscript, color: "#007aac", label: "Assembly" },
        "s": { icon: SiAssemblyscript, color: "#007aac", label: "Assembly" },
        "r": { icon: VscFileCode, color: "#276dc3", label: "R" },
        "coffee": { icon: TbCoffee, color: "#28334c", label: "CoffeeScript" },
        
        // Database
        "sql": { icon: TbSql, color: "#e38c00", label: "SQL" },
        "mysql": { icon: VscDatabase, color: "#4479a1", label: "MySQL" },
        "pgsql": { icon: SiPostgresql, color: "#4169e1", label: "PostgreSQL" },
        "mongodb": { icon: SiMongodb, color: "#47a248", label: "MongoDB" },
        "redis": { icon: SiRedis, color: "#dc382d", label: "Redis" },
        "prisma": { icon: SiPrisma, color: "#2d3748", label: "Prisma" },
        
        // Shell & Scripts
        "sh": { icon: VscTerminalBash, color: "#4eaa25", label: "Shell" },
        "bash": { icon: VscTerminalBash, color: "#4eaa25", label: "Bash" },
        "zsh": { icon: VscTerminalBash, color: "#4eaa25", label: "Zsh" },
        "fish": { icon: VscTerminalBash, color: "#4eaa25", label: "Fish" },
        "ps1": { icon: VscTerminalBash, color: "#012456", label: "PowerShell" },
        "bat": { icon: VscTerminalBash, color: "#c1f12e", label: "Batch" },
        "cmd": { icon: VscTerminalBash, color: "#c1f12e", label: "Command" },
        
        // Config
        "ini": { icon: VscSettingsGear, color: "#6d8086", label: "INI" },
        "cfg": { icon: VscSettingsGear, color: "#6d8086", label: "Config" },
        "conf": { icon: VscSettingsGear, color: "#6d8086", label: "Config" },
        "config": { icon: VscSettingsGear, color: "#6d8086", label: "Config" },
        "env": { icon: SiDotenv, color: "#ecd53f", label: "Environment" },
        
        // Media
        "svg": { icon: VscFileMedia, color: "#ffb13b", label: "SVG" },
        "png": { icon: VscFileMedia, color: "#a074c4", label: "PNG" },
        "jpg": { icon: VscFileMedia, color: "#a074c4", label: "JPEG" },
        "jpeg": { icon: VscFileMedia, color: "#a074c4", label: "JPEG" },
        "gif": { icon: VscFileMedia, color: "#a074c4", label: "GIF" },
        "webp": { icon: VscFileMedia, color: "#a074c4", label: "WebP" },
        "ico": { icon: VscFileMedia, color: "#a074c4", label: "Icon" },
        "mp3": { icon: VscFileMedia, color: "#e91e63", label: "MP3" },
        "wav": { icon: VscFileMedia, color: "#e91e63", label: "WAV" },
        "mp4": { icon: VscFileMedia, color: "#e91e63", label: "MP4" },
        "webm": { icon: VscFileMedia, color: "#e91e63", label: "WebM" },
        
        // Archives
        "zip": { icon: VscFileZip, color: "#fab040", label: "ZIP" },
        "tar": { icon: VscFileZip, color: "#fab040", label: "TAR" },
        "gz": { icon: VscFileZip, color: "#fab040", label: "GZIP" },
        "rar": { icon: VscFileZip, color: "#fab040", label: "RAR" },
        "7z": { icon: VscFileZip, color: "#fab040", label: "7-Zip" },
        
        // Git
        "git": { icon: FaGitAlt, color: "#f05032", label: "Git" },
        
        // IDE
        "code-workspace": { icon: BiLogoVisualStudio, color: "#007acc", label: "VS Code Workspace" },
        
        // Lock files
        "lock": { icon: VscLock, color: "#6d8086", label: "Lock" },
    };

    // Get icon config based on filename first, then extension
    const getIconConfig = () => {
        // Check filename match first
        if (lowerFileName && fileNameIcons[lowerFileName]) {
            return fileNameIcons[lowerFileName];
        }
        
        // Check extension match
        if (lowerExt && extensionIcons[lowerExt]) {
            return extensionIcons[lowerExt];
        }
        
        // Default icon
        return { icon: VscFile, color: "#6d8086", label: "File" };
    };

    const config = getIconConfig();
    const IconComponent = config.icon;

    return (
        <div className="file-icon-wrapper" title={config.label}>
            <IconComponent 
                className="file-icon" 
                style={{ color: config.color }}
            />
        </div>
    );
};