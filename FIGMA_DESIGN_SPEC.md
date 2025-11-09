# Coup Game - Figma Design Specification

This document contains all design specifications for recreating the Coup Game UI in Figma.

## Color Palette

### Primary Colors
- **Background**: `#F5F5F5` (Light gray background
- **Card Background**: `#FFFFFF` (White)
- **Error Background**: `#FFEBEE` (Light red)
- **Error Text**: `#C62828` (Dark red)

### Card Type Colors
- **Duke**: `#4CAF50` (Green)
- **Captain**: `#2196F3` (Blue)
- **Assassin**: `#F44336` (Red)
- **Ambassador**: `#FF9800` (Orange)
- **Contessa**: `#9C27B0` (Purple)
- **Neutral/Gray**: `#757575` (Gray)
- **Revealed Card**: `#CCCCCC` (Light gray)

### Status Colors
- **Current Player Border**: `#2196F3` (Blue, 2px border)
- **Current Chip Background**: `#E3F2FD` (Light blue)
- **Dead/Eliminated Chip Background**: `#FFEBEE` (Light red)
- **Text Secondary**: `#666666` (Medium gray)
- **Winner Text**: `#FFD700` (Gold)

### Button Colors (React Native Paper Default)
- **Primary Button**: Material Design primary color (typically blue)
- **Outlined Button**: Transparent with border
- **Text Button**: Transparent, text only

## Typography

### Font Family
- **System Default**: React Native uses system fonts
- **Figma Recommendation**: Use Roboto (Android) or San Francisco (iOS) as base

### Font Sizes & Weights
- **Headline Large**: 32px, Bold (Game Over title)
- **Headline Medium**: 24px, Bold (Screen titles)
- **Headline Small**: 20px, Bold (Section titles)
- **Title Medium**: 16px, Semi-bold (600) (Section headers, player names)
- **Body Large**: 16px, Regular (Winner info, player info)
- **Body Medium**: 14px, Regular (Subtitle, descriptions)
- **Body Small**: 12px, Regular (Labels, log entries)

## Spacing System

- **Container Padding**: 16-20px
- **Card Padding**: 16px (Card.Content)
- **Section Margin**: 16px between sections
- **Element Margin**: 8-12px between elements
- **Card Margin**: 12px between cards
- **Input Margin**: 12px between input rows

## Screen Specifications

---

## 1. Game Setup Screen

### Layout
- **Container**: Full screen, light gray background (`#F5F5F5`)
- **ScrollView**: Vertical scrollable content
- **Padding**: 20px all sides, 60px top

### Components

#### Title Section
- **Title**: "Coup Game Setup"
  - Font: Headline Medium (24px, Bold)
  - Alignment: Center
  - Margin Bottom: 8px

- **Subtitle**: "Add 2-6 players to start"
  - Font: Body Medium (14px, Regular)
  - Color: `#666666`
  - Alignment: Center
  - Margin Bottom: 24px

#### Error Card (Conditional)
- **Card**: White background with light red tint (`#FFEBEE`)
- **Padding**: 16px
- **Text**: Error messages
  - Font: Body Medium (14px)
  - Color: `#C62828`
- **Margin Bottom**: 16px

#### Player Input Section
- **Container**: Vertical stack
- **Margin Bottom**: 16px

**Player Row** (for each player):
- **Layout**: Horizontal (Row)
- **TextInput**: 
  - Width: Flexible (flex: 1)
  - Label: "Player {number}"
  - Mode: Outlined
  - Margin Right: 8px
  - Style: Material Design outlined text field
  
- **Remove Button** (if > 2 players):
  - Mode: Text
  - Text: "Remove"
  - Min Width: 80px
  - Margin Bottom: 12px

#### Add Player Button
- **Mode**: Outlined
- **Text**: "Add Player"
- **Margin Bottom**: 16px
- **Visible**: Only if < 6 players

#### Start Game Button
- **Mode**: Contained (Primary)
- **Text**: "Start Game"
- **Padding**: 8px vertical
- **Margin Top**: 8px

---

## 2. Game Screen

### Layout
- **Container**: Full screen, light gray background (`#F5F5F5`)
- **ScrollView**: Vertical scrollable
- **Padding**: 16px all sides, 32px bottom

### Header Section
- **Layout**: Horizontal (Row
- **Justify**: Space between
- **Align**: Center
- **Margin Bottom**: 16px

**Components**:
- **Title**: "Coup Game"
  - Font: Headline Small (20px, Bold)
  - Left aligned

- **Toggle Button**: "Show/Hide Cards"
  - Mode: Outlined
  - Min Width: 100px
  - Right aligned

### Players Section
- **Section Title**: "Players"
  - Font: Title Medium (16px, Semi-bold)
  - Margin Bottom: 12px

**Player Cards** (see PlayerCard component below):
- **Margin Bottom**: 12px between cards

### Actions Section (When Current Player's Turn)
- **Section Title**: "Your Turn - Choose an Action"
  - Font: Title Medium (16px, Semi-bold)
  - Margin Bottom: 12px

**Action Buttons Grid**:
- **Layout**: 2 columns, wrapped
- **Spacing**: 8px between items
- **Width**: 48% per button

**Action Button Item**:
- **Layout**: Horizontal row
- **Action Button**: 
  - Mode: Contained
  - Width: Flexible (flex: 1)
  - Padding: 4px vertical
- **Info Button**: 
  - Mode: Text
  - Text: "ℹ️"
  - Min Width: 40px
  - Margin Left: 4px

### Waiting Section (When Not Current Player)
- **Container**: White background card
- **Padding**: 16px
- **Border Radius**: 8px
- **Alignment**: Center
- **Text**: "Waiting for {player name}..."
  - Font: Title Medium (16px)
  - Color: `#666666`
- **Margin Bottom**: 16px

### Game Log Section
- **Card**: White background
- **Max Height**: 200px
- **Margin Top**: 16px

**Content**:
- **Title**: "Game Log"
  - Font: Title Medium (16px, Bold)
  - Margin Bottom: 8px

- **Log Container**: 
  - Max Height: 150px
  - Scrollable (vertical)
  - Logs displayed in reverse order (newest first)

- **Log Entry**:
  - Font: Body Small (12px)
  - Color: `#666666`
  - Margin Bottom: 4px

---

## 3. Player Card Component

### Card Structure
- **Card**: White background
- **Elevation**: 2 (shadow)
- **Padding**: 16px (Card.Content)
- **Margin Bottom**: 12px

### States
- **Normal**: White card
- **Current Player**: 
  - Border: 2px solid `#2196F3` (Blue)
- **Dead Player**: 
  - Opacity: 0.6

### Header Section
- **Layout**: Horizontal row
- **Align**: Center
- **Margin Bottom**: 8px

**Components**:
- **Player Name**: 
  - Font: Title Medium (16px, Bold)
  - Width: Flexible (flex: 1)

- **Current Chip** (if current player):
  - Mode: Flat
  - Background: `#E3F2FD`
  - Text: "Current"

- **Eliminated Chip** (if dead):
  - Mode: Flat
  - Background: `#FFEBEE`
  - Text: "Eliminated"

### Coins Section
- **Layout**: Horizontal row
- **Align**: Baseline
- **Margin Bottom**: 12px

**Components**:
- **Coins Amount**: 
  - Font: Headline Small (20px, Bold)
  - Margin Right: 4px

- **Coins Label**: 
  - Font: Body Small (12px)
  - Color: `#666666`

### Cards Section
- **Margin Top**: 8px

**Components**:
- **Cards Label**: 
  - Font: Body Small (12px)
  - Color: `#666666`
  - Text: "Cards ({alive count} alive)"
  - Margin Bottom: 4px

- **Cards Row**: 
  - Layout: Horizontal row, wrapped
  - Margin Bottom: 8px

**Expandable Card** (see below):
- **Margin Right**: 8px between cards

- **Revealed Cards Section** (if any revealed):
  - Layout: Horizontal row, wrapped
  - Margin Top: 4px

  - **Revealed Label**: 
    - Font: Body Small (12px)
    - Color: `#666666`
    - Margin Right: 4px

  - **Revealed Chips**: 
    - Mode: Outlined
    - Border Color: Card type color
    - Margin Right: 4px
    - Margin Bottom: 4px

---

## 4. Expandable Card Component

### Card Base
- **Width**: 60px
- **Height**: 
  - Collapsed: 40px
  - Expanded: 120px
- **Border Radius**: 8px
- **Padding**: 8px
- **Elevation**: 2 (shadow)
- **Overflow**: Hidden

### Background Colors
- **Hidden Card**: `#4CAF50` (Green, default)
- **Revealed Card**: `#CCCCCC` (Light gray)
- **By Type** (when shown):
  - Duke: `#4CAF50` (Green)
  - Captain: `#2196F3` (Blue)
  - Assassin: `#F44336` (Red)
  - Ambassador: `#FF9800` (Orange)
  - Contessa: `#9C27B0` (Purple)

### Card Header
- **Layout**: Center aligned
- **Min Height**: 24px

**Content**:
- **Card Initial** (if shown):
  - Font: 18px, Bold
  - Color: White (if not revealed) or `#666666` (if revealed)

- **Hidden Text** (if not shown):
  - Text: "?"
  - Font: 20px, Bold
  - Color: White

### Expanded Content
- **Height**: 80px (when expanded)
- **Margin Top**: 8px
- **Opacity**: Animated (0 to 1)

**Content** (when expanded and shown):
- **Card Name**: 
  - Font: 12px, Bold
  - Color: White (or `#666666` if revealed)
  - Alignment: Center
  - Margin Bottom: 4px

- **Card Description**: 
  - Font: 9px, Regular
  - Color: White (or `#666666` if revealed)
  - Alignment: Center
  - Line Height: 12px
  - Opacity: 0.95

**Content** (when expanded but hidden):
- **Hidden Card Text**: 
  - Font: 11px, Semi-bold (600)
  - Color: White
  - Alignment: Center
  - Margin Bottom: 4px

- **Hidden Card Subtext**: 
  - Font: 8px, Regular
  - Color: White
  - Alignment: Center
  - Opacity: 0.9

---

## 5. Action Buttons Component

### Container
- **Width**: 100%
- **Layout**: Grid (2 columns, wrapped)

### Action Item
- **Width**: 48% of container
- **Layout**: Horizontal row
- **Align**: Center
- **Margin Bottom**: 8px

**Components**:
- **Action Button**: 
  - Mode: Contained
  - Width: Flexible (flex: 1)
  - Padding: 4px vertical
  - Text: Action label (e.g., "Income (+1 coin)")

- **Info Button**: 
  - Mode: Text
  - Text: "ℹ️"
  - Min Width: 40px
  - Margin Left: 4px

### Action Labels
- Income: "Income (+1 coin)"
- Foreign Aid: "Foreign Aid (+2 coins)"
- Coup: "Coup (7 coins)"
- Tax: "Tax (+3 coins)"
- Steal: "Steal (2 coins)"
- Assassinate: "Assassinate (3 coins)"
- Exchange: "Exchange Cards"

---

## 6. Challenge/Block Modal

### Modal Container
- **Background**: Semi-transparent overlay
- **Padding**: 20px

### Card
- **Background**: White
- **Elevation**: 8
- **Padding**: 16px (Card.Content)

### Content

#### Title
- **Text**: "Challenge Phase" or "Block Phase"
- **Font**: Headline Small (20px, Bold)
- **Alignment**: Center
- **Margin Bottom**: 16px

#### Action Text
- **Text**: "{Player name} performed: {Action type}"
- **Font**: Body Large (16px, Semi-bold)
- **Alignment**: Center
- **Margin Bottom**: 8px

#### Target Text (if applicable)
- **Text**: "Target: {Player name}"
- **Font**: Body Medium (14px)
- **Color**: `#666666`
- **Alignment**: Center
- **Margin Bottom**: 16px

#### Timer Section
- **Margin Bottom**: 24px

**Components**:
- **Progress Bar**: 
  - Color: `#F44336` (Red)
  - Height: 4px
  - Progress: 0 to 1 (based on time remaining)

- **Timer Text**: 
  - Font: Body Small (12px)
  - Color: `#666666`
  - Alignment: Center
  - Margin Top: 8px
  - Text: "{seconds}s remaining"

#### Actions Container
- **Margin Bottom**: 16px

**Section Title**:
- **Text**: "Challenge this action?" or "Block this action?"
- **Font**: Title Medium (16px, Semi-bold)
- **Alignment**: Center
- **Margin Bottom**: 12px

**Challenge Buttons** (Challenge Phase):
- **Button**: 
  - Mode: Contained
  - Text: "{Player name} Challenges"
  - Margin Bottom: 8px

**Block Cards** (Block Phase):
- **Chips**: 
  - Selected state: Highlighted
  - Text: Card type name
  - Margin Bottom: 8px
  - Margin Right: 8px

**Block Buttons** (Block Phase):
- **Button**: 
  - Mode: Contained
  - Text: "{Player name} Blocks"
  - Disabled: If no card selected
  - Margin Bottom: 8px

#### Skip Button
- **Mode**: Outlined
- **Text**: "Skip"
- **Margin Top**: 8px

---

## 7. Card Selection Modal

### Modal Container
- **Background**: Semi-transparent overlay
- **Padding**: 20px

### Card
- **Background**: White
- **Elevation**: 8
- **Padding**: 16px

### Content
- **Title**: "Select a Card to Lose"
- **Font**: Headline Small (20px, Bold)
- **Alignment**: Center
- **Margin Bottom**: 16px

**Card Selection**:
- **Layout**: Grid or list of selectable cards
- **Cards**: Same as ExpandableCard but selectable
- **Selected State**: Highlighted border or background

---

## 8. Game Over Screen

### Layout
- **Container**: Full screen, light gray background (`#F5F5F5`)
- **Justify**: Center
- **Padding**: 20px

### Card
- **Background**: White
- **Elevation**: 4
- **Padding**: 16px (Card.Content)
- **Alignment**: Center

### Content

#### Title
- **Text**: "Game Over!"
- **Font**: Headline Large (32px, Bold)
- **Alignment**: Center
- **Margin Bottom**: 24px

#### Winner Section (if winner exists)
- **Winner Text**: "🏆 {Winner name} Wins! 🏆"
  - Font: Headline Medium (24px, Bold)
  - Color: `#FFD700` (Gold)
  - Alignment: Center
  - Margin Bottom: 16px

- **Winner Info Container**:
  - **Alignment**: Center
  - **Margin Bottom**: 24px

  - **Final Coins**: 
    - Font: Body Large (16px)
    - Text: "Final Coins: {amount}"

  - **Remaining Cards**: 
    - Font: Body Large (16px)
    - Text: "Remaining Cards: {count}"

#### No Winner Text (if no winner)
- **Text**: "No winner determined"
- **Font**: Body Large (16px)
- **Color**: `#666666`
- **Alignment**: Center
- **Margin Bottom**: 24px

#### Final Standings Section
- **Width**: 100%
- **Margin Bottom**: 24px

**Title**:
- **Text**: "Final Standings:"
- **Font**: Title Medium (16px, Semi-bold)
- **Margin Bottom**: 12px

**Player Row** (for each player):
- **Margin Bottom**: 12px
- **Padding**: 12px
- **Background**: `#F9F9F9` (Very light gray)
- **Border Radius**: 8px

**Content**:
- **Player Name**: 
  - Font: Body Large (16px)
  - Text: "{rank}. {Player name} (Winner)" if alive

- **Player Info**: 
  - Font: Body Medium (14px)
  - Color: `#666666`
  - Margin Top: 4px
  - Text: "Coins: {amount} | Cards: {count}"

#### New Game Button
- **Mode**: Contained
- **Text**: "New Game"
- **Width**: 100%
- **Padding**: 8px vertical

---

## Component States & Interactions

### Buttons
- **Enabled**: Full opacity, primary color
- **Disabled**: Reduced opacity (typically 0.5), grayed out
- **Pressed**: Slightly darker shade

### Cards
- **Normal**: White background, elevation 2
- **Current Player**: Blue border (2px), `#2196F3`
- **Dead Player**: Opacity 0.6
- **Pressed/Touchable**: Slight elevation increase

### Expandable Cards
- **Collapsed**: 40px height, shows initial or "?"
- **Expanded**: 120px height, shows full card info
- **Animation**: Spring animation (smooth expand/collapse)

### Modals
- **Background Overlay**: Semi-transparent black (typically rgba(0,0,0,0.5))
- **Card**: White, elevated (elevation 8)
- **Dismissible**: Tap outside or close button

---

## Design Tokens Summary

### Colors
```
Background: #F5F5F5
Card Background: #FFFFFF
Error Background: #FFEBEE
Error Text: #C62828
Text Primary: #000000 (or system default)
Text Secondary: #666666
Current Player Border: #2196F3
Winner Text: #FFD700

Card Colors:
- Duke: #4CAF50
- Captain: #2196F3
- Assassin: #F44336
- Ambassador: #FF9800
- Contessa: #9C27B0
- Revealed: #CCCCCC
```

### Spacing
```
XS: 4px
S: 8px
M: 12px
L: 16px
XL: 20px
XXL: 24px
```

### Border Radius
```
Small: 8px
Medium: 12px
Large: 16px
```

### Elevation/Shadows
```
Card: elevation 2
Modal Card: elevation 8
Shadow Color: #000000
Shadow Opacity: 0.25
Shadow Offset: (0, 2)
Shadow Radius: 3.84
```

---

## Figma Setup Recommendations

1. **Create a Design System**:
   - Set up color styles for all colors
   - Create text styles for all typography variants
   - Define spacing tokens

2. **Component Structure**:
   - Create reusable components for:
     - Player Card
     - Expandable Card
     - Action Button
     - Modal
     - Game Log Entry

3. **Frames**:
   - Create frames for each screen (Setup, Game, Game Over)
   - Use mobile frame size (e.g., 375x812 for iPhone, 360x640 for Android)

4. **Auto Layout**:
   - Use Auto Layout for all containers
   - Set up proper spacing and padding
   - Enable wrapping for grids

5. **Variants**:
   - Create component variants for:
     - Card states (normal, current, dead)
     - Button states (enabled, disabled, pressed)
     - Expandable card states (collapsed, expanded, revealed)

6. **Prototyping**:
   - Link screens together
   - Add interactions for buttons and cards
   - Test modal flows

---

## Notes

- All measurements are in pixels
- React Native Paper uses Material Design 3 guidelines
- Colors follow Material Design color system
- Typography scales follow Material Design type scale
- Spacing follows 4px grid system
- All interactive elements should have proper touch targets (minimum 44x44px)

