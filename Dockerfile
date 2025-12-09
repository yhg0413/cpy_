# ./Dockerfile (프로젝트 최상위 루트)

# --- 1단계: React 빌드 (Build Stage) ---
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

# 1. React 의존성 설치
COPY client/package*.json ./
RUN npm install

# 2. 소스 코드 복사 및 빌드
COPY client/ .
RUN npm run build
# -> 결과물은 /app/build 에 생성됨


# --- 2단계: Node.js 실행 (Run Stage) ---
FROM node:22-alpine

WORKDIR /app

# 1. 백엔드(server) 의존성 설치
# server 폴더의 package.json을 복사
COPY server/package*.json ./
RUN npm install

# 2. 백엔드 소스 코드 복사
COPY server/ ./

# 3. [핵심] 1단계에서 빌드한 React 결과물(build 폴더)을 가져옴
COPY --from=frontend-builder /app/client/build ./build

# 4. 포트 설정 (Render는 환경변수 PORT를 주입하지만, EXPOSE는 명시적 선언)
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# 5. 서버 실행
CMD ["node", "index.js"]