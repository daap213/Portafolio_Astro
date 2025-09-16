# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a multilingual portfolio website built with Astro, showcasing professional experience, projects, skills, and education. The project is based on a template by Midudev and features Spanish/English internationalization with automated PDF CV generation and QR code creation for projects.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production (includes type checking)
npm run build

# Preview production build
npm run preview

# Type checking only
npx astro check
```

### Utility Scripts
```bash
# Generate QR codes for all project GitHub links
npm run GQR

# Generate PDF versions of CV pages (Spanish and English)
npm run GPDF
```

### Project Structure Commands
```bash
# View all source files
find src -name "*.astro" -o -name "*.js" -o -name "*.ts" | head -20

# Check configuration files
ls *.config.* *.json
```

## Architecture Overview

### Internationalization System
- **Default Locale**: Spanish (`es`) with English (`en`) support
- **Routing**: Prefix-based routing with Spanish as prefixed default
- **Content Structure**: Centralized in `src/cv_info/cv.js` with language-specific exports (`es`, `en`)
- **Pages**: Separate locale-specific files in `src/pages/[locale]/`

### Configuration Management
- **Environment-aware config**: `config.js` handles dev/prod URL differences
- **Production URLs**: `https://portafolio.daaptech.org/`
- **Development URLs**: `http://localhost:4321/`

### Content Architecture
The portfolio follows a data-driven architecture:

1. **Central Data Store** (`src/cv_info/cv.js`):
   - Contains all personal information, experience, projects, skills
   - Exports `es` and `en` objects for both languages
   - Handles dynamic URL generation for QR codes and PDFs

2. **Language-Specific Configurations** (`src/cv_info/es.js`, `src/cv_info/en.js`):
   - Import data from central store
   - Configure navigation, sections, and UI elements
   - Export structured objects for page consumption

3. **Component-Based Sections**:
   - `Hero.astro`: About me section with social links
   - `Experience.astro`: Professional work history
   - `Projects.astro`: Project showcase with GitHub links
   - `Publications.astro`: Academic publications
   - `Education.astro`: Educational background
   - `AllSkills.astro`: Technical and personal skills
   - `Certificados.astro`: Certifications and courses

### Path Aliases
- `@/*`: Maps to `src/*`
- `@cv/*`: Maps to `src/cv_info/*`

### Automation Features

#### QR Code Generation
- **Script**: `src/scripts/url_to_qr.js`
- **Purpose**: Generates QR codes for project GitHub links and certificate links
- **Output**: `public/img/qr/` directory
- **Triggered by**: `npm run GQR`

#### PDF CV Generation  
- **Script**: `src/scripts/pdf_cv.js`
- **Purpose**: Uses Puppeteer to generate PDF versions of CV pages
- **Output**: `public/docs/CV_EN.pdf` and `public/docs/CV_ESP.pdf`
- **Features**: Custom headers/footers, print-optimized styling
- **Triggered by**: `npm run GPDF`

#### CI/CD Pipeline
- **File**: `.github/workflows/deploy.yml`
- **Triggers**: 
  - Push to `cloud_version` branch
  - Changes to CV-related files (`src/cv_info/cv.js`, CV Astro pages)
- **Process**: 
  1. Detects changes in CV files
  2. Builds site and starts preview server
  3. Generates fresh PDFs
  4. Commits updated PDFs back to repository
  5. Deploys to Cloudflare

### Styling System
- **Framework**: Tailwind CSS with dark mode support
- **Font**: Onest Variable font family
- **Theme**: Responsive design with glass morphism effects
- **Dark Mode**: Automatic system preference detection

## Important File Locations

### Core Content
- `src/cv_info/cv.js` - Central data store for all content
- `config.js` - Environment-specific configuration

### Automation Scripts
- `src/scripts/url_to_qr.js` - QR code generation
- `src/scripts/pdf_cv.js` - PDF CV generation

### Generated Assets
- `public/img/qr/` - Generated QR codes
- `public/docs/` - Generated PDF CVs
- `public/img/projects/` - Project images

### Key Configuration Files
- `astro.config.mjs` - Astro configuration with i18n setup
- `tailwind.config.mjs` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration with path aliases

## Development Notes

### Content Updates
When updating CV content:
1. Modify `src/cv_info/cv.js` for the source data
2. Run `npm run GQR` to update QR codes if URLs changed
3. Run `npm run GPDF` to regenerate PDF CVs
4. The CI/CD pipeline will automatically handle this in production

### Adding New Projects
Projects are defined in the `proyectos` array within `cv.js`. Each project should include:
- `title`, `description`, `github` (for QR generation), `image`, `qr` (path)

### Language Support
To add content in a new language:
1. Add locale to `astro.config.mjs`
2. Create new data export in `cv.js`
3. Create corresponding configuration file in `cv_info/`
4. Add new page routes in `src/pages/[locale]/`

### Local Development Tips
- Use `npm run preview` to test production builds locally
- PDF generation requires the server to be running
- QR codes are generated to `public/img/qr/` and referenced in the data files

## Production Deployment
The site deploys to `https://portafolio.daaptech.org/` via Cloudflare, with automatic PDF regeneration when CV content changes.