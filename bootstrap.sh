set -e
export DEBIAN_FRONTEND=noninteractive
export YODA_REPO=${QUARRY_REPO:-"https://github.com/binocarlos/yoda.git"}

apt-get update
apt-get install -y git make curl software-properties-common

cd ~ && test -d yoda || git clone $YODA_REPO
cd ~/yoda && make install